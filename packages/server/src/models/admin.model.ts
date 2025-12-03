import { BaseRepository } from '../utils/base-repository';

// 管理员
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
  status: number; // 0禁用 1正常
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class AdminUserRepository extends BaseRepository<IAdminUser> {
  constructor() {
    super('admin_users');
  }

  async findByAdminId(adminId: string): Promise<IAdminUser | null> {
    return this.findOne({ adminId });
  }

  async findByUsername(username: string): Promise<IAdminUser | null> {
    return this.findOne({ username });
  }

  async updateLastLogin(adminId: string, ip: string): Promise<boolean> {
    const admin = await this.findByAdminId(adminId);
    if (!admin) return false;
    return this.updateById(admin._id!, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    } as Partial<IAdminUser>);
  }
}

export const AdminUser = new AdminUserRepository();

// 角色
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

class AdminRoleRepository extends BaseRepository<IAdminRole> {
  constructor() {
    super('admin_roles');
  }

  async findByRoleId(roleId: string): Promise<IAdminRole | null> {
    return this.findOne({ roleId });
  }

  async findByCode(code: string): Promise<IAdminRole | null> {
    return this.findOne({ code });
  }

  async findActiveRoles(): Promise<IAdminRole[]> {
    const { data } = await this.collection.where({ status: 1 }).get();
    return data as IAdminRole[];
  }
}

export const AdminRole = new AdminRoleRepository();

// 权限定义
export interface IAdminPermission {
  _id?: string;
  permissionId: string;
  name: string;
  code: string;
  module: string;
  type: string; // menu/button/api
  parentId?: string;
  sortOrder: number;
}

class AdminPermissionRepository extends BaseRepository<IAdminPermission> {
  constructor() {
    super('admin_permissions');
  }

  async findByCode(code: string): Promise<IAdminPermission | null> {
    return this.findOne({ code });
  }

  async findByModule(module: string): Promise<IAdminPermission[]> {
    const { data } = await this.collection
      .where({ module })
      .orderBy('sortOrder', 'asc')
      .get();
    return data as IAdminPermission[];
  }

  async findAll(): Promise<IAdminPermission[]> {
    const { data } = await this.collection.orderBy('sortOrder', 'asc').get();
    return data as IAdminPermission[];
  }
}

export const AdminPermission = new AdminPermissionRepository();

// 操作日志
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

class OperationLogRepository extends BaseRepository<IOperationLog> {
  constructor() {
    super('operation_logs');
  }

  async findByAdminId(adminId: string, limit = 100): Promise<IOperationLog[]> {
    const { data } = await this.collection
      .where({ adminId })
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return data as IOperationLog[];
  }

  async findByModule(module: string, limit = 100): Promise<IOperationLog[]> {
    const { data } = await this.collection
      .where({ module })
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return data as IOperationLog[];
  }
}

export const OperationLog = new OperationLogRepository();
