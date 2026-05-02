const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyAuthToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(verifyAuthToken);

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const type = req.query.type || 'all'; // tasks, projects, users, all
    const userId = req.user.id;

    if (!q) {
      return res.status(200).json({ success: true, data: { tasks: [], projects: [], users: [] } });
    }

    const searchCondition = { contains: q, mode: 'insensitive' };
    let tasks = [], projects = [], users = [];

    if (type === 'all' || type === 'projects') {
      const pWhere = req.user.role === 'ADMIN' 
        ? { OR: [{ title: searchCondition }, { description: searchCondition }] }
        : {
            AND: [
              { members: { some: { userId } } },
              { OR: [{ title: searchCondition }, { description: searchCondition }] }
            ]
          };
      projects = await prisma.project.findMany({
        where: pWhere,
        take: 10,
        select: { id: true, title: true, status: true }
      });
    }

    if (type === 'all' || type === 'tasks') {
       const projectIds = req.user.role === 'ADMIN'
         ? (await prisma.project.findMany({ select: { id: true } })).map(p => p.id)
         : (await prisma.projectMember.findMany({ where: { userId }, select: { projectId: true } })).map(m => m.projectId);

       tasks = await prisma.task.findMany({
         where: {
           projectId: { in: projectIds },
           OR: [{ title: searchCondition }, { description: searchCondition }]
         },
         take: 10,
         include: { project: { select: { title: true } } }
       });
    }

    if (req.user.role === 'ADMIN' && (type === 'all' || type === 'users')) {
      users = await prisma.user.findMany({
        where: {
          OR: [{ name: searchCondition }, { email: searchCondition }]
        },
        take: 10,
        select: { id: true, name: true, email: true, role: true, avatarUrl: true }
      });
    }

    res.status(200).json({
      success: true,
      data: { tasks, projects, users }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
