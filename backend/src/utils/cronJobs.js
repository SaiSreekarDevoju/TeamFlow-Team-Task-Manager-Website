const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { createNotification } = require('./notifier');

const prisma = new PrismaClient();

// Run every day at 00:05
cron.schedule('5 0 * * *', async () => {
  console.log('Running daily overdue check...');
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          lt: today
        },
        status: {
          not: 'DONE'
        },
        isArchived: false,
        assigneeId: {
          not: null
        }
      },
      include: {
        project: true
      }
    });

    console.log(`Found ${overdueTasks.length} overdue tasks.`);

    for (const task of overdueTasks) {
      await createNotification({
        type: 'OVERDUE',
        message: `Task is overdue: ${task.title}`,
        link: `/projects/${task.projectId}/tasks/${task.id}`,
        recipientId: task.assigneeId
      });
    }

  } catch (error) {
    console.error('Error running overdue cron job:', error);
  }
});
