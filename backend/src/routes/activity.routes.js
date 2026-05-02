const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { getPagination, getPaginationMeta } = require('../utils/paginate');
const { verifyAuthToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const prisma = new PrismaClient();
const router = express.Router();

router.use(verifyAuthToken);

// Global feed for ADMIN
router.get('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { skip, take } = getPagination(req.query.page, req.query.limit);
    
    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        skip,
        take,
        include: {
          actor: { select: { id: true, name: true, avatarUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activityLog.count()
    ]);

    res.status(200).json({
      success: true,
      data: activities,
      meta: getPaginationMeta(total, req.query.page, req.query.limit)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
