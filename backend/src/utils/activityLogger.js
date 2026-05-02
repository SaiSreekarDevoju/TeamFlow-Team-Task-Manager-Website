const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logActivity = async ({ action, entityType, entityId, actorId, projectId, taskId, metadata }) => {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        actorId,
        projectId,
        taskId,
        metadata: metadata ? metadata : undefined
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
