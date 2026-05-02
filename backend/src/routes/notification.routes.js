const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyAuthToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const prisma = new PrismaClient();
const router = express.Router();

router.use(verifyAuthToken);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.status(200).json({ success: true, data: { message: 'All marked as read' } });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id, recipientId: req.user.id },
      data: { isRead: true }
    });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.notification.delete({
      where: { id: req.params.id, recipientId: req.user.id }
    });
    res.status(200).json({ success: true, data: { message: 'Deleted' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
