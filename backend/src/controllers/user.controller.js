const userService = require('../services/user.service');
const { getPagination, getPaginationMeta } = require('../utils/paginate');

const getUsers = async (req, res, next) => {
  try {
    const { skip, take } = getPagination(req.query.page, req.query.limit);
    const result = await userService.getUsers({ ...req.query, skip, take });
    
    res.status(200).json({
      success: true,
      data: result.users,
      meta: getPaginationMeta(result.total, req.query.page, req.query.limit)
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    // Only ADMIN or the user themselves can view full profile
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.user.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
       return res.status(400).json({ success: false, error: { message: 'Cannot change your own status' }});
    }
    const user = await userService.toggleUserStatus(req.params.id, req.body.isActive);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
       return res.status(400).json({ success: false, error: { message: 'Cannot delete yourself' }});
    }
    await userService.deleteUser(req.params.id);
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers, getUserById, updateUser, changePassword, updateUserRole, toggleUserStatus, deleteUser
};
