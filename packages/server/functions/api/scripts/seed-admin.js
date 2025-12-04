"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 初始化管理员数据
 * 运行: yarn workspace @rocketbird/server seed:admin
 */
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// 必须在其他模块导入前加载环境变量
const __dirname = path_1.default.dirname(__filename);
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../', envFile) });
async function seedAdmin() {
    // 使用动态导入，确保环境变量已加载
    const bcryptModule = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
    const bcrypt = bcryptModule.default;
    const { v4: uuid } = await Promise.resolve().then(() => __importStar(require('uuid')));
    const { connectDatabase } = await Promise.resolve().then(() => __importStar(require('../config/database')));
    const adminModel = await Promise.resolve().then(() => __importStar(require('../models/admin.model')));
    // 使用类型断言确保类型正确
    const AdminUser = adminModel.AdminUser;
    const AdminRole = adminModel.AdminRole;
    try {
        // 初始化 TCB
        await connectDatabase();
        console.log('TCB 数据库连接成功');
        // 确保集合存在
        await AdminRole.ensureCollection();
        await AdminUser.ensureCollection();
        // 检查是否已存在超级管理员角色
        let superAdminRole = await AdminRole.findByCode('super_admin');
        if (!superAdminRole) {
            superAdminRole = await AdminRole.create({
                roleId: uuid(),
                name: '超级管理员',
                code: 'super_admin',
                description: '拥有系统所有权限',
                permissions: ['*'], // * 表示所有权限
                isSystem: true,
                status: 1,
            });
            console.log('✅ 超级管理员角色创建成功');
        }
        else {
            console.log('⏭️  超级管理员角色已存在，跳过');
        }
        // 检查是否已存在 admin 用户
        const existingAdmin = await AdminUser.findByUsername('admin');
        if (!existingAdmin) {
            // 加密密码
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
            console.log('✅ 默认管理员账号创建成功');
            console.log('');
            console.log('========================================');
            console.log('  默认管理员账号信息:');
            console.log('  用户名: admin');
            console.log('  密码: admin123');
            console.log('========================================');
            console.log('');
            console.log('⚠️  请登录后立即修改密码！');
        }
        else {
            console.log('⏭️  admin 用户已存在，跳过');
        }
        console.log('');
        console.log('✅ 初始化完成');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ 初始化失败:', error);
        process.exit(1);
    }
}
seedAdmin();
