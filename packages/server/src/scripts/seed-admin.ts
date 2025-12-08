/**
 * 初始化管理员数据
 * 运行: yarn workspace @rocketbird/server seed:admin
 */
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from '../config/database';
import { ensureDefaultAdmin } from '../services/admin-setup.service';

// 必须在其他模块导入前加载环境变量
const __dirname = path.dirname(__filename);
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });

async function seedAdmin() {
  try {
    await connectDatabase();
    console.log('TCB 数据库连接成功');
    await ensureDefaultAdmin();
    console.log('\n✅ 初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

seedAdmin();
