const projectService = require('../services/project.service');
const { getPagination, getPaginationMeta } = require('../utils/paginate');

const getProjects = async (req, res, next) => {
  try {
    const { skip, take } = getPagination(req.query.page, req.query.limit);
    const result = await projectService.getProjects(req.user.id, req.user.role, { skip, take });
    
    res.status(200).json({
      success: true,
      data: result.projects,
      meta: getPaginationMeta(result.total, req.query.page, req.query.limit)
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getProjectMembers = async (req, res, next) => {
  try {
    const members = await projectService.getProjectMembers(req.params.id);
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

const addProjectMember = async (req, res, next) => {
  try {
    const member = await projectService.addProjectMember(req.params.id, req.body.email, req.body.role, req.user.id);
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

const updateProjectMemberRole = async (req, res, next) => {
  try {
    const member = await projectService.updateProjectMemberRole(req.params.id, req.params.uid, req.body.role, req.user.id);
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

const removeProjectMember = async (req, res, next) => {
  try {
    const result = await projectService.removeProjectMember(req.params.id, req.params.uid, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getProjectLabels = async (req, res, next) => {
  try {
    const labels = await projectService.getProjectLabels(req.params.id);
    res.status(200).json({ success: true, data: labels });
  } catch (error) {
    next(error);
  }
};

const createProjectLabel = async (req, res, next) => {
  try {
    const label = await projectService.createProjectLabel(req.params.id, req.body);
    res.status(201).json({ success: true, data: label });
  } catch (error) {
    next(error);
  }
};

const deleteProjectLabel = async (req, res, next) => {
  try {
    const result = await projectService.deleteProjectLabel(req.params.id, req.params.lid);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects, createProject, getProjectById, updateProject, deleteProject,
  getProjectMembers, addProjectMember, updateProjectMemberRole, removeProjectMember,
  getProjectLabels, createProjectLabel, deleteProjectLabel
};
