/**
 * 测试用户登录
 * 运行: node dist/scripts/test-login.js
 */
const dotenvTest = require('dotenv');
const pathTest = require('path');
const bcryptTest = require('bcryptjs');
const { db: dbTest } = require('../config/database');

async function testLogin() {
  // 加载环境变量
  const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
  dotenvTest.config({ path: pathTest.resolve(process.cwd(), '..', '..', envFile) });

  console.log('开始测试用户登录...');

  try {
    // 测试手机号
    const testPhone = '13800000001';
    const testPassword = '123456';

    console.log(`测试手机号: ${testPhone}`);
    console.log(`测试密码: ${testPassword}`);

    // 查找用户
    const user = await dbTest.collection('users').where({
      phone: testPhone,
    }).get();

    console.log('数据库查询结果:', user.data.length > 0 ? '找到用户' : '未找到用户');

    if (user.data.length > 0) {
      const foundUser = user.data[0];
      console.log('用户信息:', {
        userId: foundUser.userId,
        username: foundUser.username,
        phone: foundUser.phone,
        hasPassword: !!foundUser.password,
        status: foundUser.status,
      });

      // 验证密码
      if (foundUser.password) {
        const isValid = await bcryptTest.compare(testPassword, foundUser.password);
        console.log('密码验证结果:', isValid ? '正确' : '错误');
      } else {
        console.log('用户未设置密码');
      }
    } else {
      console.log('用户不存在');
    }

  } catch (error) {
    console.error('测试失败:', error);
  }
}

testLogin();