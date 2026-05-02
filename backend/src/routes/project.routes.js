const express = require('express');
const { getProjects, createProject, getProjectById, updateProject, deleteProject, getProjectMembers, addProjectMember, updateProjectMemberRole, removeProjectMember, getProjectLabels, createProjectLabel, deleteProjectLabel } = require('../controllers/project.controller');
const { verifyAuthToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/projectAccess');
const { validate } = require('../middleware/validate');
const { z } = require('zod');

// We will mount tasks in project route
const taskRoutes = require('./task.routes');

const router = express.Router();

router.use(verifyAuthToken);

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'ON_HOLD']).optional(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

const labelSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i)
});

router.get('/', getProjects);
router.post('/', requireRole('ADMIN'), validate(projectSchema), createProject);

router.get('/:id', requireProjectMember, getProjectById);
router.patch('/:id', requireProjectAdmin, validate(projectSchema.partial()), updateProject);
router.delete('/:id', requireRole('ADMIN'), deleteProject);

// Members
router.get('/:id/members', requireProjectMember, getProjectMembers);
router.post('/:id/members', requireProjectAdmin, validate(z.object({ email: z.string().email(), role: z.enum(['ADMIN', 'MEMBER']) })), addProjectMember);
router.patch('/:id/members/:uid', requireProjectAdmin, validate(z.object({ role: z.enum(['ADMIN', 'MEMBER']) })), updateProjectMemberRole);
router.delete('/:id/members/:uid', requireProjectAdmin, removeProjectMember);

// Labels
router.get('/:id/labels', requireProjectMember, getProjectLabels);
router.post('/:id/labels', requireProjectAdmin, validate(labelSchema), createProjectLabel);
router.delete('/:id/labels/:lid', requireProjectAdmin, deleteProjectLabel);

// Mount task routes
router.use('/:pid/tasks', requireProjectMember, taskRoutes);

module.exports = router;
