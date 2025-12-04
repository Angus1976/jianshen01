/**
 * 添加测试用户
 * 运行: node dist/scripts/add-test-users.js
 */
const dotenvConfig = require('dotenv');
const pathModule = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { db } = require('../config/database');

async function addTestUsers() {
  // 加载环境变量
  const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
  dotenvConfig.config({ path: pathModule.resolve(process.cwd(), '..', '..', envFile) });

  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('envFile:', envFile);
  console.log('TCB_SECRET_ID:', process.env.TCB_SECRET_ID ? 'loaded' : 'undefined');

  console.log('开始添加测试用户...');

  try {
    // 测试用户数据
    const testUsers = [
      {
        userId: uuid(),
        username: 'testuser1',
        password: await bcrypt.hash('password123', 10),
        realName: '测试用户1',
        phone: '13800138001',
        email: 'test1@example.com',
        level: 1,
        points: 100,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: uuid(),
        username: 'testuser2',
        password: await bcrypt.hash('password123', 10),
        realName: '测试用户2',
        phone: '13800138002',
        email: 'test2@example.com',
        level: 1,
        points: 200,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: uuid(),
        username: 'testuser3',
        password: await bcrypt.hash('password123', 10),
        realName: '测试用户3',
        phone: '13800138003',
        email: 'test3@example.com',
        level: 2,
        points: 500,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // 新增手机号+密码用户
      {
        userId: uuid(),
        username: '13800000001',
        password: await bcrypt.hash('123456', 10),
        realName: '张三',
        phone: '13800000001',
        email: 'zhangsan@example.com',
        level: 1,
        points: 50,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: uuid(),
        username: '13800000002',
        password: await bcrypt.hash('123456', 10),
        realName: '李四',
        phone: '13800000002',
        email: 'lisi@example.com',
        level: 1,
        points: 150,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: uuid(),
        username: '13800000003',
        password: await bcrypt.hash('123456', 10),
        realName: '王五',
        phone: '13800000003',
        email: 'wangwu@example.com',
        level: 2,
        points: 300,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: uuid(),
        username: '13800000004',
        password: await bcrypt.hash('123456', 10),
        realName: '赵六',
        phone: '13800000004',
        email: 'zhaoliu@example.com',
        level: 3,
        points: 800,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: uuid(),
        username: '13800000005',
        password: await bcrypt.hash('123456', 10),
        realName: '孙七',
        phone: '13800000005',
        email: 'sunqi@example.com',
        level: 1,
        points: 0,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 检查并插入用户
    for (const user of testUsers) {
      const existingUser = await db.collection('users').where({
        username: user.username,
      }).get();

      if (existingUser.data.length === 0) {
        await db.collection('users').add(user);
        console.log(`✅ 测试用户 ${user.username} 创建成功`);
      } else {
        console.log(`⏭️  测试用户 ${user.username} 已存在，跳过`);
      }
    }

    console.log('');
    console.log('========================================');
    console.log('  测试用户账号信息:');
    console.log('  用户名用户:');
    console.log('    testuser1, testuser2, testuser3');
    console.log('    密码: password123');
    console.log('  手机号用户:');
    console.log('    13800000001, 13800000002, 13800000003, 13800000004, 13800000005');
    console.log('    密码: 123456');
    console.log('========================================');
    console.log('');
    console.log('✅ 测试用户添加完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 添加测试用户失败:', error);
    process.exit(1);
  }
}

addTestUsers();