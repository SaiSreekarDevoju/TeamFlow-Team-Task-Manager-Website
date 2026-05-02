const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async ({ type, message, link, recipientId }) => {
  try {
    await prisma.notification.create({
      data: {
        type,
        message,
        link,
        recipientId
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

module.exports = { createNotification };
