const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const authModel = require('./auth.model');
const { AppError } = require('../../middleware/errorHandler');

const authService = {
  async login(username, password) {
    const user = authModel.findByUsername(username);
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    authModel.updateLastLogin(user.id);

    const token = generateToken(user);
    return {
      token,
      user: sanitizeUser(user),
    };
  },

  async pinLogin(pinCode) {
    const user = authModel.findByPin(pinCode);
    if (!user) {
      throw new AppError('Invalid PIN', 401, 'INVALID_PIN');
    }

    authModel.updateLastLogin(user.id);

    const token = generateToken(user);
    return {
      token,
      user: sanitizeUser(user),
    };
  },

  getProfile(userId) {
    const user = authModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return user;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = authModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    const hash = await bcrypt.hash(newPassword, 12);
    authModel.updatePassword(userId, hash);
  },
};

function generateToken(user) {
  const permissions = user.permissions ? JSON.parse(user.permissions) : [];
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role_name,
      permissions,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function sanitizeUser(user) {
  const { password_hash, pin_code, permissions, ...safe } = user;
  return safe;
}

module.exports = authService;
