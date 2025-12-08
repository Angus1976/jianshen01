import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { AdminRole, AdminUser } from '../models/admin.model';

/**
 * 确保超级管理员角色与默认 admin 账号存在。
 */
export async function ensureDefaultAdmin() {
  console.log('🔐 校验/创建默认管理员账号...');
  await (AdminRole as any).ensureCollection();
  await (AdminUser as any).ensureCollection();

  let superAdminRole = await AdminRole.findByCode('super_admin');

  if (!superAdminRole) {
    superAdminRole = await AdminRole.create({
      roleId: uuid(),
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有系统所有权限',
      permissions: ['*'],
      isSystem: true,
      status: 1,
    });
    console.log('✅ 超级管理员角色已创建');
  } else {
    console.log('⏭️ 超级管理员角色已存在，跳过');
  }

  const existingAdmin = await AdminUser.findByUsername('admin');
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await AdminUser.create({
      adminId: uuid(),
      username: 'admin',
      password: hashedPassword,
      realName: '系统管理员',
      roleId: superAdminRole.roleId,
      roleName: superAdminRole.name,
      status: 1,
    });
    console.log('✅ 默认管理员账号创建成功（admin / admin123）');
  } else {
    console.log('⏭️ admin 用户已存在，跳过');
  }
}