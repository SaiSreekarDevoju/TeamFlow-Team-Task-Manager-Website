const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyAuthToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(verifyAuthToken);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Get project IDs user has access to
    const accessibleProjectIds = role === 'ADMIN' 
      ? (await prisma.project.findMany({ select: { id: true } })).map(p => p.id)
      : (await prisma.projectMember.findMany({ where: { userId }, select: { projectId: true } })).map(m => m.projectId);

    // My tasks stats
    const myTasks = await prisma.task.findMany({
      where: { assigneeId: userId, isArchived: false }
    });

    const totalTasksAssignedToMe = myTasks.length;
    const tasksDueToday = myTasks.filter(t => t.dueDate && new Date(t.dueDate).getTime() === today.getTime() && t.status !== 'DONE').length;
    const tasksOverdue = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE').length;
    
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const tasksDoneThisWeek = myTasks.filter(t => t.status === 'DONE' && t.updatedAt >= weekAgo).length;

    // By status & priority (for my tasks)
    const tasksByStatus = myTasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
    const tasksByPriority = myTasks.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});

    // Upcoming deadlines (my tasks)
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
        dueDate: { gte: today, lte: nextWeek }
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { project: { select: { title: true } } }
    });

    // Overdue list (my tasks)
    const overdueTasksList = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
        dueDate: { lt: today }
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { project: { select: { title: true } } }
    });

    // Recent Activity (projects I have access to)
    const recentActivity = await prisma.activityLog.findMany({
      where: { projectId: { in: accessibleProjectIds } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { actor: { select: { name: true, avatarUrl: true } } }
    });

    // Admin specific stats
    let tasksPerUser = [];
    let projectProgress = [];

    if (role === 'ADMIN') {
      const allUsers = await prisma.user.findMany({ select: { id: true, name: true, _count: { select: { assignedTasks: { where: { isArchived: false, status: { not: 'DONE' } } } } } } });
      tasksPerUser = allUsers.map(u => ({ userId: u.id, name: u.name, count: u._count.assignedTasks })).sort((a,b) => b.count - a.count).slice(0, 5);
    }

    const projects = await prisma.project.findMany({
      where: { id: { in: accessibleProjectIds }, status: 'ACTIVE' },
      include: {
        _count: { select: { tasks: true } }
      }
    });

    for (const p of projects) {
      const doneCount = await prisma.task.count({ where: { projectId: p.id, status: 'DONE' } });
      const percent = p._count.tasks > 0 ? Math.round((doneCount / p._count.tasks) * 100) : 0;
      projectProgress.push({ projectId: p.id, title: p.title, done: doneCount, total: p._count.tasks, percent });
    }

    res.status(200).json({
      success: true,
      data: {
        totalTasksAssignedToMe,
        tasksDueToday,
        tasksOverdue,
        tasksDoneThisWeek,
        tasksByStatus,
        tasksByPriority,
        upcomingDeadlines,
        overdueTasksList,
        recentActivity,
        tasksPerUser,
        projectProgress
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
