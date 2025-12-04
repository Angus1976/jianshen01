"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const admin_model_1 = require("../../models/admin.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// 定义权限模块
const PERMISSION_MODULES = [
    {
        module: 'system',
        name: '系统管理',
        permissions: [
            { code: 'system:account:view', name: '查看管理员' },
            { code: 'system:account:create', name: '创建管理员' },
            { code: 'system:account:edit', name: '编辑管理员' },
            { code: 'system:account:delete', name: '删除管理员' },
            { code: 'system:role:view', name: '查看角色' },
            { code: 'system:role:create', name: '创建角色' },
            { code: 'system:role:edit', name: '编辑角色' },
            { code: 'system:role:delete', name: '删除角色' },
            { code: 'system:log:view', name: '查看日志' },
        ],
    },
    {
        module: 'member',
        name: '会员管理',
        permissions: [
            { code: 'member:view', name: '查看会员' },
            { code: 'member:edit', name: '编辑会员' },
            { code: 'member:level', name: '调整等级' },
            { code: 'member:points', name: '调整积分' },
        ],
    },
    {
        module: 'level',
        name: '等级管理',
        permissions: [
            { code: 'level:view', name: '查看等级' },
            { code: 'level:create', name: '创建等级' },
            { code: 'level:edit', name: '编辑等级' },
            { code: 'level:delete', name: '删除等级' },
        ],
    },
    {
        module: 'points',
        name: '积分管理',
        permissions: [
            { code: 'points:product:view', name: '查看商品' },
            { code: 'points:product:create', name: '创建商品' },
            { code: 'points:product:edit', name: '编辑商品' },
            { code: 'points:product:delete', name: '删除商品' },
            { code: 'points:order:view', name: '查看订单' },
            { code: 'points:order:verify', name: '核销订单' },
        ],
    },
    {
        module: 'checkin',
        name: '签到管理',
        permissions: [
            { code: 'checkin:theme:view', name: '查看主题' },
            { code: 'checkin:theme:create', name: '创建主题' },
            { code: 'checkin:theme:edit', name: '编辑主题' },
            { code: 'checkin:theme:delete', name: '删除主题' },
            { code: 'checkin:record:view', name: '查看记录' },
            { code: 'checkin:record:review', name: '审核记录' },
        ],
    },
    {
        module: 'benefits',
        name: '权益管理',
        permissions: [
            { code: 'benefits:rule:view', name: '查看规则' },
            { code: 'benefits:rule:create', name: '创建规则' },
            { code: 'benefits:rule:edit', name: '编辑规则' },
            { code: 'benefits:rule:delete', name: '删除规则' },
        ],
    },
    {
        module: 'meals',
        name: '餐品管理',
        permissions: [
            { code: 'meals:view', name: '查看餐品' },
            { code: 'meals:create', name: '创建餐品' },
            { code: 'meals:edit', name: '编辑餐品' },
            { code: 'meals:delete', name: '删除餐品' },
        ],
    },
    {
        module: 'referral',
        name: '推荐管理',
        permissions: [
            { code: 'referral:view', name: '查看推荐' },
            { code: 'referral:edit', name: '编辑规则' },
        ],
    },
    {
        module: 'feedback',
        name: '反馈管理',
        permissions: [
            { code: 'feedback:view', name: '查看反馈' },
            { code: 'feedback:reply', name: '回复反馈' },
        ],
    },
    {
        module: 'brand',
        name: '品牌管理',
        permissions: [
            { code: 'brand:info:view', name: '查看品牌' },
            { code: 'brand:info:edit', name: '编辑品牌' },
            { code: 'brand:article:view', name: '查看文章' },
            { code: 'brand:article:create', name: '创建文章' },
            { code: 'brand:article:edit', name: '编辑文章' },
            { code: 'brand:article:delete', name: '删除文章' },
            { code: 'brand:store:view', name: '查看门店' },
            { code: 'brand:store:create', name: '创建门店' },
            { code: 'brand:store:edit', name: '编辑门店' },
            { code: 'brand:store:delete', name: '删除门店' },
            { code: 'brand:banner:view', name: '查看轮播' },
            { code: 'brand:banner:create', name: '创建轮播' },
            { code: 'brand:banner:edit', name: '编辑轮播' },
            { code: 'brand:banner:delete', name: '删除轮播' },
        ],
    },
];
// GET /api/admin/roles/permissions - 获取权限树 (必须在 /:roleId 之前)
router.get('/permissions', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        (0, response_1.success)(res, PERMISSION_MODULES);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/roles - 获取角色列表
router.get('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, keyword, status } = req.query;
        const query = {};
        if (keyword) {
            query.name = new RegExp(keyword, 'i');
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await admin_model_1.AdminRole.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'createdAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/roles - 创建角色
router.post('/', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, code, description, permissions } = req.body;
        if (!name || !code) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '角色名称和编码不能为空');
        }
        // 检查编码是否已存在
        const existingRole = await admin_model_1.AdminRole.findByCode(code);
        if (existingRole) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '角色编码已存在');
        }
        const role = await admin_model_1.AdminRole.create({
            roleId: (0, uuid_1.v4)(),
            name,
            code,
            description,
            permissions: permissions || [],
            isSystem: false,
            status: 1,
        });
        (0, response_1.success)(res, role, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// GET /api/admin/roles/:roleId - 获取角色详情
router.get('/:roleId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const role = await admin_model_1.AdminRole.findByRoleId(roleId);
        if (!role) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '角色不存在', 404);
        }
        (0, response_1.success)(res, role);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/roles/:roleId - 更新角色
router.put('/:roleId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const { name, description, permissions, status } = req.body;
        const role = await admin_model_1.AdminRole.findByRoleId(roleId);
        if (!role) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '角色不存在', 404);
        }
        // 系统角色不能修改编码
        if (role.isSystem) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '系统角色不能修改');
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (permissions !== undefined)
            updateData.permissions = permissions;
        if (status !== undefined)
            updateData.status = status;
        await admin_model_1.AdminRole.updateById(role._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/roles/:roleId - 删除角色
router.delete('/:roleId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const role = await admin_model_1.AdminRole.findByRoleId(roleId);
        if (!role) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '角色不存在', 404);
        }
        // 系统角色不能删除
        if (role.isSystem) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '系统角色不能删除');
        }
        // 检查是否有管理员在使用此角色
        const adminsWithRole = await admin_model_1.AdminUser.find({ roleId });
        if (adminsWithRole.length > 0) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '该角色下存在管理员，无法删除');
        }
        await admin_model_1.AdminRole.deleteById(role._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
