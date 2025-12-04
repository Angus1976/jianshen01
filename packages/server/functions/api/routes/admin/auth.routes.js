"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const admin_model_1 = require("../../models/admin.model");
const config_1 = require("../../config");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// POST /api/admin/auth/login - 管理员登录
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        // 参数校验
        if (!username || !password) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '用户名和密码不能为空');
        }
        // 查找用户
        const admin = await admin_model_1.AdminUser.findByUsername(username);
        if (!admin) {
            return (0, response_1.error)(res, shared_1.ApiCode.Unauthorized, '用户名或密码错误', 401);
        }
        // 检查账号状态
        if (admin.status !== 1) {
            return (0, response_1.error)(res, shared_1.ApiCode.Forbidden, '账号已被禁用', 403);
        }
        // 验证密码
        const isPasswordValid = await bcryptjs_1.default.compare(password, admin.password);
        if (!isPasswordValid) {
            return (0, response_1.error)(res, shared_1.ApiCode.Unauthorized, '用户名或密码错误', 401);
        }
        // 获取角色信息
        const role = await admin_model_1.AdminRole.findByRoleId(admin.roleId);
        // 生成 JWT Token
        const signOptions = {
            expiresIn: config_1.config.jwt.accessTokenExpire,
        };
        const token = jsonwebtoken_1.default.sign({
            adminId: admin.adminId,
            username: admin.username,
            roleId: admin.roleId,
            permissions: (role === null || role === void 0 ? void 0 : role.permissions) || [],
        }, config_1.config.jwt.adminSecret, signOptions);
        // 更新最后登录信息
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
        await admin_model_1.AdminUser.updateLastLogin(admin.adminId, clientIp);
        // 返回登录信息
        (0, response_1.success)(res, {
            token,
            adminInfo: {
                adminId: admin.adminId,
                username: admin.username,
                realName: admin.realName,
                avatar: admin.avatar,
                roleId: admin.roleId,
                roleName: admin.roleName,
                permissions: (role === null || role === void 0 ? void 0 : role.permissions) || [],
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/auth/logout - 管理员登出
router.post('/logout', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        // JWT 无状态，客户端清除 token 即可
        // 如需实现 token 黑名单，可在此添加逻辑
        (0, response_1.success)(res, { message: '登出成功' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/auth/profile - 获取当前管理员信息
router.get('/profile', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const admin = await admin_model_1.AdminUser.findByAdminId(req.admin.adminId);
        if (!admin) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '管理员不存在', 404);
        }
        const role = await admin_model_1.AdminRole.findByRoleId(admin.roleId);
        (0, response_1.success)(res, {
            adminId: admin.adminId,
            username: admin.username,
            realName: admin.realName,
            phone: admin.phone,
            email: admin.email,
            avatar: admin.avatar,
            roleId: admin.roleId,
            roleName: admin.roleName,
            permissions: (role === null || role === void 0 ? void 0 : role.permissions) || [],
            lastLoginAt: admin.lastLoginAt,
            lastLoginIp: admin.lastLoginIp,
        });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/auth/profile - 更新个人信息
router.put('/profile', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { realName, phone, email, avatar } = req.body;
        const admin = await admin_model_1.AdminUser.findByAdminId(req.admin.adminId);
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
        await admin_model_1.AdminUser.updateById(admin._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/auth/password - 修改密码
router.put('/password', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '请输入旧密码和新密码');
        }
        if (newPassword.length < 6) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '新密码长度不能少于6位');
        }
        const admin = await admin_model_1.AdminUser.findByAdminId(req.admin.adminId);
        if (!admin) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '管理员不存在', 404);
        }
        // 验证旧密码
        const isOldPasswordValid = await bcryptjs_1.default.compare(oldPassword, admin.password);
        if (!isOldPasswordValid) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '旧密码错误');
        }
        // 加密新密码
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await admin_model_1.AdminUser.updateById(admin._id, { password: hashedPassword });
        (0, response_1.success)(res, { message: '密码修改成功' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
