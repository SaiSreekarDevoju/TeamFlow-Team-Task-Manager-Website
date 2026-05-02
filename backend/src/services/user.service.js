const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/hashPassword');

const prisma = new PrismaClient();

const getUsers = async (query) => {
  const { search, role, isActive, skip, take } = query;
  
  let where = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true, name: true, email: true, avatarUrl: true, role: true, isActive: true, lastLoginAt: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, avatarUrl: true, role: true, isActive: true, lastLoginAt: true, createdAt: true
    }
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

const updateUser = async (id, data) => {
  const { name, avatarUrl } = data;
  return await prisma.user.update({
    where: { id },
    data: { name, avatarUrl },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true }
  });
};

const changePassword = async (id, data) => {
  const { currentPassword, newPassword } = data;
  
  const user = await prisma.user.findUnique({ where: { id } });
  
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    const err = new Error('Incorrect current password');
    err.statusCode = 400;
    throw err;
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id },
    data: { password: hashedNewPassword }
  });

  return { message: 'Password updated successfully' };
};

const updateUserRole = async (id, role) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true }
  });
};

const toggleUserStatus = async (id, isActive) => {
  return await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, isActive: true }
  });
};

const deleteUser = async (id) => {
  // Hard delete
  await prisma.user.delete({
    where: { id }
  });
  return { message: 'User deleted successfully' };
};

module.exports = {
  getUsers, getUserById, updateUser, changePassword, updateUserRole, toggleUserStatus, deleteUser
};
