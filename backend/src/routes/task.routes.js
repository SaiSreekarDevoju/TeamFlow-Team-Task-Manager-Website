const express = require('express');
const { getTasks, createTask, getTaskById, updateTask, updateTaskStatus, deleteTask, logTime, reorderTasks, createSubtask, createComment, deleteComment, uploadAttachment, deleteAttachment } = require('../controllers/task.controller');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ 
  storage, 
  limits: { fileSize: (process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024 } 
});

const router = express.Router({ mergeParams: true });

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional()
});

router.get('/', getTasks);
router.post('/', validate(taskSchema), createTask);
router.post('/reorder', validate(z.object({ updates: z.array(z.object({ id: z.string().uuid(), position: z.number(), status: z.string() })) })), reorderTasks);

router.get('/:id', getTaskById);
router.patch('/:id', validate(taskSchema.partial()), updateTask);
router.delete('/:id', deleteTask);

router.patch('/:id/status', validate(z.object({ status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']) })), updateTaskStatus);
router.patch('/:id/log-time', validate(z.object({ hours: z.number().positive() })), logTime);

router.post('/:id/subtasks', validate(z.object({ title: z.string().min(1) })), createSubtask);

// Comments
router.post('/:id/comments', validate(z.object({ content: z.string().min(1) })), createComment);
router.delete('/:id/comments/:cid', deleteComment);

// Attachments
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:aid', deleteAttachment);

module.exports = router;
