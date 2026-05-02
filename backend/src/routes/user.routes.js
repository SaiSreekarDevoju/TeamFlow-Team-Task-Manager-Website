const express = require('express');
const { getUsers, getUserById, updateUser, changePassword, updateUserRole, toggleUserStatus, deleteUser } = require('../controllers/user.controller');
const { verifyAuthToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { z } = require('zod');

const router = express.Router();

router.use(verifyAuthToken);

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match", path: ["confirmPassword"]
});

// ADMIN only
router.get('/', requireRole('ADMIN'), getUsers);
router.patch('/:id/role', requireRole('ADMIN'), validate(z.object({ role: z.enum(['ADMIN', 'MEMBER']) })), updateUserRole);
router.patch('/:id/status', requireRole('ADMIN'), validate(z.object({ isActive: z.boolean() })), toggleUserStatus);
router.delete('/:id', requireRole('ADMIN'), deleteUser);

// Profile
router.put('/me/password', validate(changePasswordSchema), changePassword);
router.get('/:id', getUserById);
router.patch('/:id', validate(updateProfileSchema), updateUser);

module.exports = router;
