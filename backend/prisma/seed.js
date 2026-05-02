const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const memberPassword = await bcrypt.hash('Member@1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@teamflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@teamflow.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@teamflow.com' },
    update: {},
    create: {
      name: 'John Member',
      email: 'member@teamflow.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // Create Projects
  const project1 = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      title: 'Website Redesign',
      description: 'Overhaul the corporate website with a new modern design.',
      status: 'ACTIVE',
      ownerId: admin.id,
      startDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'seed-project-2' },
    update: {},
    create: {
      id: 'seed-project-2',
      title: 'Mobile App MVP',
      description: 'Initial release of the mobile companion app.',
      status: 'ON_HOLD',
      ownerId: admin.id,
    },
  });

  // Project Memberships
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: admin.id } },
    update: {},
    create: { projectId: project1.id, userId: admin.id, role: 'ADMIN' },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: member.id } },
    update: {},
    create: { projectId: project1.id, userId: member.id, role: 'MEMBER' },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project2.id, userId: admin.id } },
    update: {},
    create: { projectId: project2.id, userId: admin.id, role: 'ADMIN' },
  });

  // Labels
  const labels = await Promise.all([
    prisma.label.upsert({
      where: { name_projectId: { name: 'Bug', projectId: project1.id } },
      update: {},
      create: { name: 'Bug', color: '#EF4444', projectId: project1.id },
    }),
    prisma.label.upsert({
      where: { name_projectId: { name: 'Feature', projectId: project1.id } },
      update: {},
      create: { name: 'Feature', color: '#3B82F6', projectId: project1.id },
    }),
    prisma.label.upsert({
      where: { name_projectId: { name: 'Urgent', projectId: project1.id } },
      update: {},
      create: { name: 'Urgent', color: '#F59E0B', projectId: project1.id },
    }),
  ]);

  // Tasks
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasksData = [
    {
      title: 'Design system setup',
      status: 'DONE',
      priority: 'HIGH',
      projectId: project1.id,
      assigneeId: member.id,
      reporterId: admin.id,
      dueDate: yesterday, // Not overdue since it's DONE
      position: 0,
    },
    {
      title: 'Homepage wireframes',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      projectId: project1.id,
      assigneeId: member.id,
      reporterId: admin.id,
      dueDate: tomorrow,
      position: 0,
    },
    {
      title: 'Fix navigation bug',
      status: 'TODO',
      priority: 'CRITICAL',
      projectId: project1.id,
      assigneeId: admin.id,
      reporterId: member.id,
      dueDate: yesterday, // Overdue
      position: 0,
    },
    {
      title: 'Write copy for About page',
      status: 'IN_PROGRESS',
      priority: 'LOW',
      projectId: project1.id,
      assigneeId: member.id,
      reporterId: admin.id,
      dueDate: yesterday, // Overdue
      position: 0,
    },
    {
      title: 'Setup backend repo',
      status: 'TODO',
      priority: 'HIGH',
      projectId: project2.id,
      assigneeId: admin.id,
      reporterId: admin.id,
      dueDate: tomorrow,
      position: 0,
    },
  ];

  for (const t of tasksData) {
    const createdTask = await prisma.task.create({
      data: t,
    });
    
    // add some labels
    if (t.priority === 'CRITICAL') {
      await prisma.taskLabel.create({
        data: { taskId: createdTask.id, labelId: labels[2].id } // Urgent
      });
      await prisma.taskLabel.create({
        data: { taskId: createdTask.id, labelId: labels[0].id } // Bug
      });
    }

    // Add activity log
    await prisma.activityLog.create({
      data: {
        action: 'created task',
        entityType: 'Task',
        entityId: createdTask.id,
        actorId: t.reporterId,
        projectId: t.projectId,
        taskId: createdTask.id
      }
    });
  }

  // Sample Comments
  const allTasks = await prisma.task.findMany();
  if (allTasks.length > 0) {
    await prisma.comment.create({
      data: {
        content: 'I have started working on this @admin.',
        taskId: allTasks[1].id,
        authorId: member.id,
      }
    });
    await prisma.comment.create({
      data: {
        content: 'Please make sure to check the latest designs.',
        taskId: allTasks[1].id,
        authorId: admin.id,
      }
    });
  }

  // Sample Notifications
  await prisma.notification.create({
    data: {
      type: 'MENTION',
      message: 'John Member mentioned you in a comment.',
      link: `/projects/${project1.id}/tasks/${allTasks[1].id}`,
      recipientId: admin.id,
    }
  });

  await prisma.notification.create({
    data: {
      type: 'ASSIGNMENT',
      message: 'You have been assigned to: Fix navigation bug',
      link: `/projects/${project1.id}/tasks/${allTasks[2].id}`,
      recipientId: admin.id,
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
