"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const admin_model_1 = require("../../models/admin.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/admin/accounts - 获取管理员列表
router.get('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, keyword, status, roleId } = req.query;
        const query = {};
        if (keyword) {
            query.username = new RegExp(keyword, 'i');
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        if (roleId) {
            query.roleId = roleId;
        }
        const result = await admin_model_1.AdminUser.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        // 移除密码字段
        const list = result.list.map(({ password, ...rest }) => rest);
        (0, response_1.paginated)(res, list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/accounts - 创建管理员
router.post('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { username, password, realName, phone, email, avatar, roleId } = req.body;
        // 参数校验
        if (!username || !password || !roleId) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '用户名、密码和角色不能为空');
        }
        if (password.length < 6) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '密码长度不能少于6位');
        }
        // 检查用户名是否已存在
        const existingAdmin = await admin_model_1.AdminUser.findByUsername(username);
        if (existingAdmin) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '用户名已存在');
        }
        // 获取角色信息
        const role = await admin_model_1.AdminRole.findByRoleId(roleId);
        if (!role) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '角色不存在');
        }
        // 加密密码
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // 创建管理员
        const admin = await admin_model_1.AdminUser.create({
            adminId: (0, uuid_1.v4)(),
            username,
            password: hashedPassword,
            realName: realName || username,
            phone,
            email,
            avatar,
            roleId,
            roleName: role.name,
            status: 1,
            createdBy: req.admin.adminId,
        });
        const { password: _, ...adminData } = admin;
        (0, response_1.success)(res, adminData, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/accounts/:adminId - 获取管理员详情
router.get('/:adminId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { adminId } = req.params;
        const admin = await admin_model_1.AdminUser.findByAdminId(adminId);
        if (!admin) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '管理员不存在', 404);
        }
        const { password, ...adminData } = admin;
        (0, response_1.success)(res, adminData);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/accounts/:adminId - 更新管理员
router.put('/:adminId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { adminId } = req.params;
        const { realName, phone, email, avatar, roleId } = req.body;
        const admin = await admin_model_1.AdminUser.findByAdminId(adminId);
        if (!admin) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '管理员不存在', 404);
        }
        const updateData = {};
        if (realName !== undefined)
            updateData.realName = realName;
        if (phone !== undefined)
            updateData.phone = phone;
        if (email !== undefined)
            updateData.email = email;
        if (avatar !== undefined)
            updateData.avatar = avatar;
        // 如果更新角色
        if (roleId && roleId !== admin.roleId) {
            const role = await admin_model_1.AdminRole.findByRoleId(roleId);
            if (!role) {
                return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '角色不存在');
            }
            updateData.roleId = roleId;
            updateData.roleName = role.name;
        }
        await admin_model_1.AdminUser.updateById(admin._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/accounts/:adminId - 删除管理员
router.delete('/:adminId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { adminId } = req.params;
        // 不能删除自己
        if (adminId === req.admin.adminId) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '不能删除自己的账号');
        }
        const admin = await admin_model_1.AdminUser.findByAdminId(adminId);
        if (!admin) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '管理员不存在', 404);
        }
        // 检查是否是超级管理员
        const role = await admin_model_1.AdminRole.findByRoleId(admin.roleId);
        if ((role === null || role === void 0 ? void 0 : role.code) === 'super_admin') {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '不能删除超级管理员');
        }
        await admin_model_1.AdminUser.deleteById(admin._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/accounts/:adminId/reset-password - 重置密码
router.post('/:adminId/reset-password', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { adminId } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '新密码长度不能少于6位');
        }
        const admin = await admin_model_1.AdminUser.findByAdminId(adminId);
        if (!admin) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '管理员不存在', 404);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await admin_model_1.AdminUser.updateById(admin._id, { password: hashedPassword });
        (0, response_1.success)(res, { message: '密码重置成功' });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/accounts/:adminId/status - 更新管理员状态
router.put('/:adminId/status', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { adminId } = req.params;
        const { status } = req.body;
        if (status !== 0 && status !== 1) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '状态值无效');
        }
        // 不能禁用自己
        if (adminId === req.admin.adminId) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '不能修改自己的状态');
        }
        const admin = await admin_model_1.AdminUser.findByAdminId(adminId);
        if (!admin) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '管理员不存在', 404);
        }
        // 不能禁用超级管理员
        const role = await admin_model_1.AdminRole.findByRoleId(admin.roleId);
        if ((role === null || role === void 0 ? void 0 : role.code) === 'super_admin' && status === 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '不能禁用超级管理员');
        }
        await admin_model_1.AdminUser.updateById(admin._id, { status });
        (0, response_1.success)(res, { message: status === 1 ? '启用成功' : '禁用成功' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
