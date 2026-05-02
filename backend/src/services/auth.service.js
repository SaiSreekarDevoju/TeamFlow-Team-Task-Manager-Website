const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { signToken } = require('../utils/jwt');

const prisma = new PrismaClient();

const registerUser = async (data) => {
  const { name, email, password } = data;

  const userExists = await prisma.user.findUnique({
    where: { email }
  });

  if (userExists) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const isFirstUser = await prisma.user.count() === 0;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: isFirstUser ? 'ADMIN' : 'MEMBER'
    }
  });

  const token = signToken({ id: user.id });

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

const loginUser = async (data) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !user.isActive) {
    const error = new Error('Invalid credentials or account inactive');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const token = signToken({ id: user.id });

  const { password: _, ...userWithoutPassword } = updatedUser;

  return { user: userWithoutPassword, token };
};

module.exports = { registerUser, loginUser };
