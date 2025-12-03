import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import { AdminUser, AdminRole, IAdminUser } from '../../models/admin.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// GET /api/admin/accounts - 获取管理员列表
router.get('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, status, roleId } = req.query;

    const query: Record<string, unknown> = {};
    if (keyword) {
      query.username = new RegExp(keyword as string, 'i');
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }
    if (roleId) {
      query.roleId = roleId;
    }

    const result = await AdminUser.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'createdAt', direction: 'desc' }
    );

    // 移除密码字段
    const list = result.list.map(({ password, ...rest }) => rest);

    paginated(res, list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/accounts - 创建管理员
router.post('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { username, password, realName, phone, email, avatar, roleId } = req.body;

    // 参数校验
    if (!username || !password || !roleId) {
      return error(res, ApiCode.BadRequest, '用户名、密码和角色不能为空');
    }

    if (password.length < 6) {
      return error(res, ApiCode.BadRequest, '密码长度不能少于6位');
    }

    // 检查用户名是否已存在
    const existingAdmin = await AdminUser.findByUsername(username);
    if (existingAdmin) {
      return error(res, ApiCode.BadRequest, '用户名已存在');
    }

    // 获取角色信息
    const role = await AdminRole.findByRoleId(roleId);
    if (!role) {
      return error(res, ApiCode.BadRequest, '角色不存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建管理员
    const admin = await AdminUser.create({
      adminId: uuid(),
      username,
      password: hashedPassword,
      realName: realName || username,
      phone,
      email,
      avatar,
      roleId,
      roleName: role.name,
      status: 1,
      createdBy: req.admin!.adminId,
    });

    const { password: _, ...adminData } = admin;
    success(res, adminData, '创建成功');
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/accounts/:adminId - 获取管理员详情
router.get('/:adminId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const admin = await AdminUser.findByAdminId(adminId);
    if (!admin) {
      return error(res, ApiCode.NotFound, '管理员不存在', 404);
    }

    const { password, ...adminData } = admin;
    success(res, adminData);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/accounts/:adminId - 更新管理员
router.put('/:adminId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { realName, phone, email, avatar, roleId } = req.body;

    const admin = await AdminUser.findByAdminId(adminId);
    if (!admin) {
      return error(res, ApiCode.NotFound, '管理员不存在', 404);
    }

    const updateData: Partial<IAdminUser> = {};
    if (realName !== undefined) updateData.realName = realName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    // 如果更新角色
    if (roleId && roleId !== admin.roleId) {
      const role = await AdminRole.findByRoleId(roleId);
      if (!role) {
        return error(res, ApiCode.BadRequest, '角色不存在');
      }
      updateData.roleId = roleId;
      updateData.roleName = role.name;
    }

    await AdminUser.updateById(admin._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/accounts/:adminId - 删除管理员
router.delete('/:adminId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { adminId } = req.params;

    // 不能删除自己
    if (adminId === req.admin!.adminId) {
      return error(res, ApiCode.BadRequest, '不能删除自己的账号');
    }

    const admin = await AdminUser.findByAdminId(adminId);
    if (!admin) {
      return error(res, ApiCode.NotFound, '管理员不存在', 404);
    }

    // 检查是否是超级管理员
    const role = await AdminRole.findByRoleId(admin.roleId);
    if (role?.code === 'super_admin') {
      return error(res, ApiCode.BadRequest, '不能删除超级管理员');
    }

    await AdminUser.deleteById(admin._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/accounts/:adminId/reset-password - 重置密码
router.post('/:adminId/reset-password', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return error(res, ApiCode.BadRequest, '新密码长度不能少于6位');
    }

    const admin = await AdminUser.findByAdminId(adminId);
    if (!admin) {
      return error(res, ApiCode.NotFound, '管理员不存在', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await AdminUser.updateById(admin._id!, { password: hashedPassword });

    success(res, { message: '密码重置成功' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/accounts/:adminId/status - 更新管理员状态
router.put('/:adminId/status', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { status } = req.body;

    if (status !== 0 && status !== 1) {
      return error(res, ApiCode.BadRequest, '状态值无效');
    }

    // 不能禁用自己
    if (adminId === req.admin!.adminId) {
      return error(res, ApiCode.BadRequest, '不能修改自己的状态');
    }

    const admin = await AdminUser.findByAdminId(adminId);
    if (!admin) {
      return error(res, ApiCode.NotFound, '管理员不存在', 404);
    }

    // 不能禁用超级管理员
    const role = await AdminRole.findByRoleId(admin.roleId);
    if (role?.code === 'super_admin' && status === 0) {
      return error(res, ApiCode.BadRequest, '不能禁用超级管理员');
    }

    await AdminUser.updateById(admin._id!, { status });
    success(res, { message: status === 1 ? '启用成功' : '禁用成功' });
  } catch (err) {
    next(err);
  }
});

export default router;
