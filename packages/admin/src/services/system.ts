import { get, post, put, del } from '@/utils/request';

// 管理员
export interface AdminUser {
  _id?: string;
  adminId: string;
  username: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  roleId: string;
  roleName?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  status: number;
  isSuper?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 角色
export interface AdminRole {
  _id?: string;
  roleId: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

// 权限模块
export interface PermissionModule {
  module: string;
  name: string;
  permissions: Array<{ code: string; name: string }>;
}

// 操作日志
export interface OperationLog {
  _id?: string;
  logId: string;
  adminId: string;
  adminName?: string;
  module: string;
  action: string;
  content?: string;
  ip?: string;
  userAgent?: string;
  createdAt?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 管理员相关
export interface AdminListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  roleId?: string;
  status?: number | string;
}

export const getAdminList = (params: AdminListParams) => {
  return get<PaginatedResult<AdminUser>>('/accounts', params);
};

export const getAdminDetail = (adminId: string) => {
  return get<AdminUser>(`/accounts/${adminId}`);
};

export const createAdmin = (data: {
  username: string;
  password: string;
  nickname?: string;
  phone?: string;
  email?: string;
  roleId: string;
}) => {
  return post<AdminUser>('/accounts', data);
};

export const updateAdmin = (adminId: string, data: Partial<AdminUser>) => {
  return put<{ message: string }>(`/accounts/${adminId}`, data);
};

export const deleteAdmin = (adminId: string) => {
  return del<{ message: string }>(`/accounts/${adminId}`);
};

export const resetAdminPassword = (adminId: string, data: { password: string }) => {
  return put<{ message: string }>(`/accounts/${adminId}/password`, data);
};

export const updateAdminStatus = (adminId: string, data: { status: number }) => {
  return put<{ message: string }>(`/accounts/${adminId}/status`, data);
};

// 角色相关
export interface RoleListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number | string;
}

export const getRoleList = (params: RoleListParams) => {
  return get<PaginatedResult<AdminRole>>('/roles', params);
};

export const getRoleDetail = (roleId: string) => {
  return get<AdminRole>(`/roles/${roleId}`);
};

export const createRole = (data: {
  name: string;
  code: string;
  description?: string;
  permissions: string[];
}) => {
  return post<AdminRole>('/roles', data);
};

export const updateRole = (roleId: string, data: Partial<AdminRole>) => {
  return put<{ message: string }>(`/roles/${roleId}`, data);
};

export const deleteRole = (roleId: string) => {
  return del<{ message: string }>(`/roles/${roleId}`);
};

export const getPermissions = () => {
  return get<PermissionModule[]>('/roles/permissions');
};

// 日志相关
export interface LogListParams {
  page?: number;
  pageSize?: number;
  adminId?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export const getLogList = (params: LogListParams) => {
  return get<PaginatedResult<OperationLog>>('/logs', params);
};

export const getLogDetail = (logId: string) => {
  return get<OperationLog>(`/logs/${logId}`);
};

export const exportLogs = (params: LogListParams) => {
  return get<OperationLog[]>('/logs/export', params);
};
