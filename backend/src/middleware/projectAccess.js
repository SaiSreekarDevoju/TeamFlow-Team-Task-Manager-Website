const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.pid || req.params.id; // Support both route structures
    
    if (req.user.role === 'ADMIN') {
      // Global Admins can access any project
      return next();
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a member of this project' }
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.pid || req.params.id;
    
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: req.user.id
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You must be a project ADMIN to perform this action' }
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireProjectMember, requireProjectAdmin };
