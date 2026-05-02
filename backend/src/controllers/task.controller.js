const taskService = require('../services/task.service');
const { getPagination, getPaginationMeta } = require('../utils/paginate');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTasks = async (req, res, next) => {
  try {
    const { skip, take } = getPagination(req.query.page, req.query.limit);
    const result = await taskService.getTasks(req.params.pid, { ...req.query, skip, take });
    
    res.status(200).json({
      success: true,
      data: result.tasks,
      meta: getPaginationMeta(result.total, req.query.page, req.query.limit)
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.params.pid, req.user.id, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.params.pid);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ success: false, error: { message: 'Not found' }});
    
    // Check permission: ADMIN or Assignee
    if (req.user.role !== 'ADMIN' && task.assigneeId !== req.user.id && req.membership.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' }});
    }

    const updatedTask = await taskService.updateTask(req.params.id, req.params.pid, req.body, req.user.id);
    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(req.params.id, req.params.pid, req.body.status, req.user.id);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.membership.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' }});
    }
    const result = await taskService.deleteTask(req.params.id, req.params.pid, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const logTime = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (req.user.role !== 'ADMIN' && task.assigneeId !== req.user.id) {
       return res.status(403).json({ success: false, error: { message: 'Forbidden' }});
    }
    const updated = await taskService.logTime(req.params.id, req.params.pid, req.body.hours, req.user.id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const reorderTasks = async (req, res, next) => {
  try {
    const result = await taskService.reorderTasks(req.params.pid, req.body.updates, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createSubtask = async (req, res, next) => {
  try {
    const task = await taskService.createSubtask(req.params.pid, req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const comment = await taskService.createComment(req.params.id, req.user.id, req.body.content);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.cid;
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    
    if (req.user.role !== 'ADMIN' && comment.authorId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    
    await prisma.comment.delete({ where: { id: commentId } });
    res.status(200).json({ success: true, data: { message: 'Comment deleted' } });
  } catch (error) {
    next(error);
  }
};

// Attachment (mock for now, assume file is uploaded via middleware)
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    
    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`, // Assuming local storage
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        taskId: req.params.id,
        uploaderId: req.user.id
      }
    });
    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    next(error);
  }
};

const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await prisma.attachment.findUnique({ where: { id: req.params.aid } });
    if (!attachment) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    
    if (req.user.role !== 'ADMIN' && attachment.uploaderId !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    
    await prisma.attachment.delete({ where: { id: req.params.aid } });
    res.status(200).json({ success: true, data: { message: 'Attachment deleted' } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks, createTask, getTaskById, updateTask, updateTaskStatus, deleteTask,
  logTime, reorderTasks, createSubtask, createComment, deleteComment,
  uploadAttachment, deleteAttachment
};
