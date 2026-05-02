const { PrismaClient } = require('@prisma/client');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notifier');

const prisma = new PrismaClient();

const getTasks = async (projectId, query) => {
  const { status, priority, assigneeId, labelId, overdue, search, sortBy, order, skip, take } = query;

  let where = { projectId, isArchived: false };
  
  if (status) {
    where.status = { in: status.split(',') };
  }
  if (priority) {
    where.priority = { in: priority.split(',') };
  }
  if (assigneeId) {
    where.assigneeId = assigneeId;
  }
  if (labelId) {
    where.labels = { some: { labelId: { in: labelId.split(',') } } };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  if (overdue === 'true') {
    where.dueDate = { lt: today };
    where.status = { not: 'DONE' };
  }

  let orderBy = {};
  if (sortBy) {
    orderBy[sortBy] = order || 'asc';
  } else {
    // Default Kanban ordering
    orderBy = [{ status: 'asc' }, { position: 'asc' }];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        reporter: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { comments: true, subtasks: true, labels: true } },
        labels: { include: { label: true } }
      },
      orderBy
    }),
    prisma.task.count({ where })
  ]);

  // Compute isOverdue
  const formattedTasks = tasks.map(t => ({
    ...t,
    isOverdue: t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE'
  }));

  return { tasks: formattedTasks, total };
};

const createTask = async (projectId, reporterId, data) => {
  const { labelIds, ...taskData } = data;

  // Compute position (append to end)
  const maxPosTask = await prisma.task.findFirst({
    where: { projectId, status: taskData.status || 'TODO' },
    orderBy: { position: 'desc' }
  });
  const position = maxPosTask ? maxPosTask.position + 1024 : 1024;

  const task = await prisma.task.create({
    data: {
      ...taskData,
      projectId,
      reporterId,
      position,
      labels: labelIds && labelIds.length > 0 ? {
        create: labelIds.map(id => ({ labelId: id }))
      } : undefined
    },
    include: {
      assignee: true,
      labels: { include: { label: true } }
    }
  });

  await logActivity({
    action: 'created task',
    entityType: 'Task',
    entityId: task.id,
    actorId: reporterId,
    projectId,
    taskId: task.id
  });

  if (task.assigneeId && task.assigneeId !== reporterId) {
    await createNotification({
      type: 'ASSIGNMENT',
      message: `You were assigned a new task: ${task.title}`,
      link: `/projects/${projectId}/tasks/${task.id}`,
      recipientId: task.assigneeId
    });
  }

  return task;
};

const getTaskById = async (id, projectId) => {
  const task = await prisma.task.findFirst({
    where: { id, projectId },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true, avatarUrl: true } },
      labels: { include: { label: true } },
      subtasks: { orderBy: { position: 'asc' } },
      comments: { 
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      },
      attachments: {
        include: { uploader: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      },
      activities: {
        include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
  
  const today = new Date();
  today.setHours(0,0,0,0);
  task.isOverdue = task.dueDate && new Date(task.dueDate) < today && task.status !== 'DONE';

  return task;
};

const updateTask = async (id, projectId, data, actorId) => {
  const { labelIds, ...updateData } = data;
  
  const oldTask = await prisma.task.findUnique({ where: { id } });

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...updateData,
      ...(labelIds && {
        labels: {
          deleteMany: {},
          create: labelIds.map(lid => ({ labelId: lid }))
        }
      })
    },
    include: { assignee: true }
  });

  // Determine what changed for activity log
  const changes = {};
  for (const key of Object.keys(updateData)) {
    if (oldTask[key] !== updateData[key]) {
      changes[key] = { from: oldTask[key], to: updateData[key] };
    }
  }

  if (Object.keys(changes).length > 0) {
    await logActivity({
      action: 'updated task',
      entityType: 'Task',
      entityId: id,
      actorId,
      projectId,
      taskId: id,
      metadata: { changes }
    });
  }

  // Notify if assignee changed
  if (updateData.assigneeId && updateData.assigneeId !== oldTask.assigneeId && updateData.assigneeId !== actorId) {
    await createNotification({
      type: 'ASSIGNMENT',
      message: `You were assigned a task: ${task.title}`,
      link: `/projects/${projectId}/tasks/${task.id}`,
      recipientId: task.assigneeId
    });
  }

  return task;
};

const updateTaskStatus = async (id, projectId, status, actorId) => {
  const oldTask = await prisma.task.findUnique({ where: { id } });
  
  const task = await prisma.task.update({
    where: { id },
    data: { status }
  });

  await logActivity({
    action: `changed status to ${status}`,
    entityType: 'Task',
    entityId: id,
    actorId,
    projectId,
    taskId: id
  });

  if (task.assigneeId && task.assigneeId !== actorId) {
    await createNotification({
      type: 'STATUS_CHANGE',
      message: `Task status changed to ${status}: ${task.title}`,
      link: `/projects/${projectId}/tasks/${task.id}`,
      recipientId: task.assigneeId
    });
  }

  return task;
};

const deleteTask = async (id, projectId, actorId) => {
  await prisma.task.delete({ where: { id } });
  
  await logActivity({
    action: 'deleted task',
    entityType: 'Task',
    entityId: id,
    actorId,
    projectId
  });
  return { message: 'Task deleted successfully' };
};

const logTime = async (id, projectId, hours, actorId) => {
  const task = await prisma.task.update({
    where: { id },
    data: { loggedHours: { increment: hours } }
  });
  
  await logActivity({
    action: `logged ${hours} hours`,
    entityType: 'Task',
    entityId: id,
    actorId,
    projectId,
    taskId: id
  });

  return task;
};

const reorderTasks = async (projectId, updates, actorId) => {
  const transaction = updates.map(u => prisma.task.update({
    where: { id: u.id },
    data: { position: u.position, status: u.status }
  }));

  await prisma.$transaction(transaction);
  return { message: 'Tasks reordered' };
};

const createSubtask = async (projectId, parentTaskId, reporterId, data) => {
  const { title } = data;
  const maxPosTask = await prisma.task.findFirst({
    where: { parentTaskId },
    orderBy: { position: 'desc' }
  });
  const position = maxPosTask ? maxPosTask.position + 1024 : 1024;

  const task = await prisma.task.create({
    data: {
      title,
      projectId,
      parentTaskId,
      reporterId,
      position,
      status: 'TODO'
    }
  });
  return task;
};

// --- Comments ---
const createComment = async (taskId, authorId, content) => {
  const comment = await prisma.comment.create({
    data: { content, taskId, authorId },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } }
  });
  
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: true } });
  
  // Parse @mentions
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];
    // Find user by name (assuming name can be matched this way for demo, ideally we need username field or use ID in mention)
    // For simplicity, we assume username is part of email or name.
    const mentionedUser = await prisma.user.findFirst({
      where: { OR: [ { name: { contains: username, mode: 'insensitive' } }, { email: { startsWith: username } } ] }
    });
    
    if (mentionedUser && mentionedUser.id !== authorId) {
      await createNotification({
        type: 'MENTION',
        message: `${comment.author.name} mentioned you in a comment`,
        link: `/projects/${task.projectId}/tasks/${taskId}`,
        recipientId: mentionedUser.id
      });
    }
  }

  await logActivity({
    action: 'added a comment',
    entityType: 'Task',
    entityId: taskId,
    actorId: authorId,
    projectId: task.projectId,
    taskId: taskId
  });

  return comment;
};

module.exports = {
  getTasks, createTask, getTaskById, updateTask, updateTaskStatus, deleteTask,
  logTime, reorderTasks, createSubtask, createComment
};
