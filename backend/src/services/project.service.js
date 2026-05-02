const { PrismaClient } = require('@prisma/client');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notifier');

const prisma = new PrismaClient();

const getProjects = async (userId, userRole, query) => {
  const { skip, take } = query;
  
  let where = {};
  if (userRole !== 'ADMIN') {
    where = {
      members: { some: { userId } }
    };
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.project.count({ where })
  ]);

  return { projects, total };
};

const createProject = async (userId, data) => {
  const project = await prisma.project.create({
    data: {
      ...data,
      ownerId: userId,
      members: {
        create: { userId, role: 'ADMIN' }
      }
    }
  });

  await logActivity({
    action: 'created project',
    entityType: 'Project',
    entityId: project.id,
    actorId: userId,
    projectId: project.id
  });

  return project;
};

const getProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { members: true, tasks: true } }
    }
  });

  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  // task Summary by status
  const taskSummaryRaw = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId: id },
    _count: true
  });

  const taskSummary = taskSummaryRaw.reduce((acc, curr) => {
    acc[curr.status] = curr._count;
    return acc;
  }, {});

  return { ...project, taskSummary };
};

const updateProject = async (id, data, actorId) => {
  const project = await prisma.project.update({
    where: { id },
    data
  });

  await logActivity({
    action: 'updated project',
    entityType: 'Project',
    entityId: id,
    actorId,
    projectId: id,
    metadata: data
  });

  return project;
};

const deleteProject = async (id, actorId) => {
  await prisma.project.delete({ where: { id } });
  
  await logActivity({
    action: 'deleted project',
    entityType: 'Project',
    entityId: id,
    actorId
  });

  return { message: 'Project deleted successfully' };
};

const getProjectMembers = async (projectId) => {
  return await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } }
    },
    orderBy: { joinedAt: 'asc' }
  });
};

const addProjectMember = async (projectId, email, role, actorId) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } }
  });

  if (existingMember) {
    const err = new Error('User is already a member');
    err.statusCode = 400;
    throw err;
  }

  const member = await prisma.projectMember.create({
    data: { projectId, userId: user.id, role }
  });

  await logActivity({
    action: 'added member',
    entityType: 'Project',
    entityId: projectId,
    actorId,
    projectId,
    metadata: { addedUserId: user.id, role }
  });

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  await createNotification({
    type: 'PROJECT_INVITE',
    message: `You have been added to the project: ${project.title}`,
    link: `/projects/${projectId}`,
    recipientId: user.id
  });

  return member;
};

const updateProjectMemberRole = async (projectId, userId, role, actorId) => {
  const member = await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role }
  });

  await logActivity({
    action: 'updated member role',
    entityType: 'Project',
    entityId: projectId,
    actorId,
    projectId,
    metadata: { targetUserId: userId, newRole: role }
  });

  return member;
};

const removeProjectMember = async (projectId, userId, actorId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  
  if (project.ownerId === userId) {
    const err = new Error('Cannot remove project owner');
    err.statusCode = 400;
    throw err;
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } }
  });

  await logActivity({
    action: 'removed member',
    entityType: 'Project',
    entityId: projectId,
    actorId,
    projectId,
    metadata: { removedUserId: userId }
  });

  return { message: 'Member removed successfully' };
};

// Label service within project (could be separated but keeping it here for simplicity)
const getProjectLabels = async (projectId) => {
  return await prisma.label.findMany({ where: { projectId } });
};

const createProjectLabel = async (projectId, data) => {
  return await prisma.label.create({ data: { ...data, projectId } });
};

const deleteProjectLabel = async (projectId, id) => {
  await prisma.label.delete({ where: { id, projectId } });
  return { message: 'Label deleted' };
};

module.exports = {
  getProjects, createProject, getProjectById, updateProject, deleteProject,
  getProjectMembers, addProjectMember, updateProjectMemberRole, removeProjectMember,
  getProjectLabels, createProjectLabel, deleteProjectLabel
};
