import { BaseRepository } from '../utils/base-repository';
export interface IAdminUser {
    _id?: string;
    adminId: string;
    username: string;
    password: string;
    realName: string;
    phone?: string;
    email?: string;
    avatar?: string;
    roleId: string;
    roleName: string;
    status: number;
    lastLoginAt?: Date;
    lastLoginIp?: string;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class AdminUserRepository extends BaseRepository<IAdminUser> {
    constructor();
    findByAdminId(adminId: string): Promise<IAdminUser | null>;
    findByUsername(username: string): Promise<IAdminUser | null>;
    updateLastLogin(adminId: string, ip: string): Promise<boolean>;
}
export declare const AdminUser: AdminUserRepository;
export interface IAdminRole {
    _id?: string;
    roleId: string;
    name: string;
    code: string;
    description?: string;
    permissions: string[];
    isSystem: boolean;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class AdminRoleRepository extends BaseRepository<IAdminRole> {
    constructor();
    findByRoleId(roleId: string): Promise<IAdminRole | null>;
    findByCode(code: string): Promise<IAdminRole | null>;
    findActiveRoles(): Promise<IAdminRole[]>;
}
export declare const AdminRole: AdminRoleRepository;
export interface IAdminPermission {
    _id?: string;
    permissionId: string;
    name: string;
    code: string;
    module: string;
    type: string;
    parentId?: string;
    sortOrder: number;
}
declare class AdminPermissionRepository extends BaseRepository<IAdminPermission> {
    constructor();
    findByCode(code: string): Promise<IAdminPermission | null>;
    findByModule(module: string): Promise<IAdminPermission[]>;
    findAll(): Promise<IAdminPermission[]>;
}
export declare const AdminPermission: AdminPermissionRepository;
export interface IOperationLog {
    _id?: string;
    logId: string;
    adminId: string;
    adminName: string;
    module: string;
    action: string;
    targetType?: string;
    targetId?: string;
    content: string;
    requestData?: object;
    responseCode?: number;
    ip: string;
    userAgent?: string;
    duration?: number;
    createdAt?: Date;
}
declare class OperationLogRepository extends BaseRepository<IOperationLog> {
    constructor();
    findByAdminId(adminId: string, limit?: number): Promise<IOperationLog[]>;
    findByModule(module: string, limit?: number): Promise<IOperationLog[]>;
}
export declare const OperationLog: OperationLogRepository;
export {};
//# sourceMappingURL=admin.model.d.ts.map