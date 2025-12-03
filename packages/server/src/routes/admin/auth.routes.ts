import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error } from '../../utils/response';
import { AdminUser, AdminRole } from '../../models/admin.model';
import { config } from '../../config';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// POST /api/admin/auth/login - 管理员登录
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 参数校验
    if (!username || !password) {
      return error(res, ApiCode.BadRequest, '用户名和密码不能为空');
    }

    // 查找用户
    const admin = await AdminUser.findByUsername(username);
    if (!admin) {
      return error(res, ApiCode.Unauthorized, '用户名或密码错误', 401);
    }

    // 检查账号状态
    if (admin.status !== 1) {
      return error(res, ApiCode.Forbidden, '账号已被禁用', 403);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return error(res, ApiCode.Unauthorized, '用户名或密码错误', 401);
    }

    // 获取角色信息
    const role = await AdminRole.findByRoleId(admin.roleId);

    // 生成 JWT Token
    const signOptions: SignOptions = {
      expiresIn: config.jwt.accessTokenExpire as SignOptions['expiresIn'],
    };
    const token = jwt.sign(
      {
        adminId: admin.adminId,
        username: admin.username,
        roleId: admin.roleId,
        permissions: role?.permissions || [],
      },
      config.jwt.adminSecret,
      signOptions
    );

    // 更新最后登录信息
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    await AdminUser.updateLastLogin(admin.adminId, clientIp);

    // 返回登录信息
    success(res, {
      token,
      adminInfo: {
        adminId: admin.adminId,
        username: admin.username,
        realName: admin.realName,
        avatar: admin.avatar,
        roleId: admin.roleId,
        roleName: admin.roleName,
        permissions: role?.permissions || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/auth/logout - 管理员登出
router.post('/logout', adminAuthMiddleware, async (req, res, next) => {
  try {
    // JWT 无状态，客户端清除 token 即可
    // 如需实现 token 黑名单，可在此添加逻辑
    success(res, { message: '登出成功' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/auth/profile - 获取当前管理员信息
router.get('/profile', adminAuthMiddleware, async (req, res, next) => {
  try {
    const admin = await AdminUser.findByAdminId(req.admin!.adminId);
    if (!admin) {
      return error(res, ApiCode.NotFound, '管理员不存在', 404);
    }

    const role = await AdminRole.findByRoleId(admin.roleId);

    success(res, {
      adminId: admin.adminId,
      username: admin.username,
      realName: admin.realName,
      phone: admin.phone,
      email: admin.email,
      avatar: admin.avatar,
      roleId: admin.roleId,
      roleName: admin.roleName,
      permissions: role?.permissions || [],
      lastLoginAt: admin.lastLoginAt,
      lastLoginIp: admin.lastLoginIp,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/auth/profile - 更新个人信息
router.put('/profile', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { realName, phone, email, avatar } = req.body;

    const admin = await AdminUser.findByAdminId(req.admin!.adminId);
    if (!admin) {
      return error(res, ApiCode.NotFound, '管理员不存在', 404);
    }

    const updateData: Partial<typeof admin> = {};
    if (realName !== undefined) updateData.realName = realName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    await AdminUser.updateById(admin._id!, updateData);

    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/auth/password - 修改密码
router.put('/password', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return error(res, ApiCode.BadRequest, '请输入旧密码和新密码');
    }

    if (newPassword.length < 6) {
      return error(res, ApiCode.BadRequest, '新密码长度不能少于6位');
    }

    const admin = await AdminUser.findByAdminId(req.admin!.adminId);
    if (!admin) {
      return error(res, ApiCode.NotFound, '管理员不存在', 404);
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isOldPasswordValid) {
      return error(res, ApiCode.BadRequest, '旧密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await AdminUser.updateById(admin._id!, { password: hashedPassword });

    success(res, { message: '密码修改成功' });
  } catch (err) {
    next(err);
  }
});

export default router;
