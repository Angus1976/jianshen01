"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationLog = exports.AdminPermission = exports.AdminRole = exports.AdminUser = void 0;
const base_repository_1 = require("../utils/base-repository");
class AdminUserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('admin_users');
    }
    async findByAdminId(adminId) {
        return this.findOne({ adminId });
    }
    async findByUsername(username) {
        return this.findOne({ username });
    }
    async updateLastLogin(adminId, ip) {
        const admin = await this.findByAdminId(adminId);
        if (!admin)
            return false;
        return this.updateById(admin._id, {
            lastLoginAt: new Date(),
            lastLoginIp: ip,
        });
    }
}
exports.AdminUser = new AdminUserRepository();
class AdminRoleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('admin_roles');
    }
    async findByRoleId(roleId) {
        return this.findOne({ roleId });
    }
    async findByCode(code) {
        return this.findOne({ code });
    }
    async findActiveRoles() {
        const { data } = await this.collection.where({ status: 1 }).get();
        return data;
    }
}
exports.AdminRole = new AdminRoleRepository();
class AdminPermissionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('admin_permissions');
    }
    async findByCode(code) {
        return this.findOne({ code });
    }
    async findByModule(module) {
        const { data } = await this.collection
            .where({ module })
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
    async findAll() {
        const { data } = await this.collection.orderBy('sortOrder', 'asc').get();
        return data;
    }
}
exports.AdminPermission = new AdminPermissionRepository();
class OperationLogRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('operation_logs');
    }
    async findByAdminId(adminId, limit = 100) {
        const { data } = await this.collection
            .where({ adminId })
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        return data;
    }
    async findByModule(module, limit = 100) {
        const { data } = await this.collection
            .where({ module })
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        return data;
    }
}
exports.OperationLog = new OperationLogRepository();
