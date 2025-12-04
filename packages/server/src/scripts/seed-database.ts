/**
 * 初始化数据库集合和基础数据
 * 运行: node dist/scripts/seed-database.js
 */
const dotenv = require('dotenv');
const path = require('path');

// 必须在其他模块导入前加载环境变量
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: path.resolve(process.cwd(), '..', '..', envFile) });

console.log('TCB_SECRET_ID:', process.env.TCB_SECRET_ID);
console.log('TCB_SECRET_KEY:', process.env.TCB_SECRET_KEY ? 'loaded' : 'undefined');

async function seedDatabase() {
  const { v4: uuid } = await import('uuid');
  const { getTCBApp } = await import('../config/database');

  // 需要创建的集合列表（从 models 中提取）
  const collections = [
    // 用户相关
    'users',
    'level_rules',
    'level_change_logs',
    // 积分相关
    'points_records',
    'points_products',
    'exchange_orders',
    // 打卡相关
    'checkin_themes',
    'checkin_records',
    'share_rules',
    // 福利相关
    'benefit_rules',
    'benefit_records',
    // 健身餐相关
    'meal_categories',
    'fitness_meals',
    'meal_favorites',
    // 邀请相关
    'invite_rules',
    'invite_records',
    // 反馈
    'feedbacks',
    // 品牌相关
    'brand_info',
    'brand_articles',
    'brand_stores',
    'banners',
    // 管理后台
    'admin_users',
    'admin_roles',
    'admin_permissions',
    'operation_logs',
  ];

  console.log('\n========== 创建集合 ==========\n');

  // 创建集合
  for (const collectionName of collections) {
    try {
      const db = getTCBApp().database();
      await db.createCollection(collectionName);
      console.log(`✅ 创建集合 ${collectionName} 成功`);
    } catch (error) {
      console.log(`❌ 创建集合 ${collectionName} 失败: ${String(error)}`);
    }
  }

  console.log('\n========== 初始化等级规则 ==========\n');

  // 初始化等级规则
  try {
    const db = getTCBApp().database();
    const levelRulesCollection = db.collection('level_rules');

    // 检查是否已有数据
    const existingRules = await levelRulesCollection.count();
    if ((existingRules.total || 0) > 0) {
      console.log('⏭️ 等级规则已存在，跳过初始化');
    } else {
      const levelRules = [
        {
          level: 1,
          name: '青铜会员',
          minPoints: 0,
          maxPoints: 99,
          benefits: ['基础积分累积', '每月免费打卡1次'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          level: 2,
          name: '白银会员',
          minPoints: 100,
          maxPoints: 499,
          benefits: ['基础积分累积', '每月免费打卡3次', '健身餐优惠8折'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          level: 3,
          name: '黄金会员',
          minPoints: 500,
          maxPoints: 999,
          benefits: ['基础积分累积', '每月免费打卡5次', '健身餐优惠7折', '专属客服'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          level: 4,
          name: '钻石会员',
          minPoints: 1000,
          maxPoints: 999999,
          benefits: ['基础积分累积', '每月免费打卡10次', '健身餐优惠5折', '专属客服', '生日礼物'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const rule of levelRules) {
        await levelRulesCollection.add(rule);
      }

      console.log('✅ 等级规则初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 初始化积分商品 ==========\n');

  // 初始化积分商品
  try {
    const db = getTCBApp().database();
    const pointsProductsCollection = db.collection('points_products');

    // 检查是否已有数据
    const existingProducts = await pointsProductsCollection.count();
    if ((existingProducts.total || 0) > 0) {
      console.log('⏭️ 积分商品已存在，跳过初始化');
    } else {
      const pointsProducts = [
        {
          id: uuid(),
          name: '健身餐优惠券',
          description: '价值50元的健身餐优惠券',
          pointsCost: 100,
          type: 'coupon',
          value: 50,
          stock: 100,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '专业健身指导',
          description: '1小时专业健身指导课程',
          pointsCost: 200,
          type: 'service',
          value: 1,
          stock: 50,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '品牌运动装备',
          description: '价值200元的品牌运动装备',
          pointsCost: 400,
          type: 'product',
          value: 200,
          stock: 20,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const product of pointsProducts) {
        await pointsProductsCollection.add(product);
      }

      console.log('✅ 积分商品初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 初始化打卡主题 ==========\n');

  // 初始化打卡主题
  try {
    const db = getTCBApp().database();
    const checkinThemesCollection = db.collection('checkin_themes');

    // 检查是否已有数据
    const existingThemes = await checkinThemesCollection.count();
    if ((existingThemes.total || 0) > 0) {
      console.log('⏭️ 打卡主题已存在，跳过初始化');
    } else {
      const checkinThemes = [
        {
          id: uuid(),
          name: '每日健身',
          description: '坚持每日健身，保持健康体魄',
          icon: '🏃‍♂️',
          points: 10,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '饮食控制',
          description: '健康饮食，从每一餐开始',
          icon: '🥗',
          points: 8,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '睡眠质量',
          description: '良好的睡眠是健康的基础',
          icon: '😴',
          points: 6,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '心情记录',
          description: '记录每日心情，保持积极心态',
          icon: '😊',
          points: 5,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const theme of checkinThemes) {
        await checkinThemesCollection.add(theme);
      }

      console.log('✅ 打卡主题初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 初始化分享规则 ==========\n');

  // 初始化分享规则
  try {
    const db = getTCBApp().database();
    const shareRulesCollection = db.collection('share_rules');

    // 检查是否已有数据
    const existingRules = await shareRulesCollection.count();
    if ((existingRules.total || 0) > 0) {
      console.log('⏭️ 分享规则已存在，跳过初始化');
    } else {
      const shareRules = [
        {
          type: 'checkin',
          title: '分享打卡',
          description: '分享打卡记录给好友',
          points: 5,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: 'meal',
          title: '分享健身餐',
          description: '分享健身餐推荐给好友',
          points: 3,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: 'invite',
          title: '邀请好友',
          description: '邀请好友注册并完成首次打卡',
          points: 20,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const rule of shareRules) {
        await shareRulesCollection.add(rule);
      }

      console.log('✅ 分享规则初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 初始化邀请规则 ==========\n');

  // 初始化邀请规则
  try {
    const db = getTCBApp().database();
    const inviteRulesCollection = db.collection('invite_rules');

    // 检查是否已有数据
    const existingRules = await inviteRulesCollection.count();
    if ((existingRules.total || 0) > 0) {
      console.log('⏭️ 邀请规则已存在，跳过初始化');
    } else {
      const inviteRules = [
        {
          level: 1,
          inviteCount: 1,
          rewardPoints: 10,
          description: '邀请1位好友注册',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          level: 2,
          inviteCount: 5,
          rewardPoints: 50,
          description: '邀请5位好友注册',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          level: 3,
          inviteCount: 10,
          rewardPoints: 150,
          description: '邀请10位好友注册',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          level: 4,
          inviteCount: 20,
          rewardPoints: 400,
          description: '邀请20位好友注册',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const rule of inviteRules) {
        await inviteRulesCollection.add(rule);
      }

      console.log('✅ 邀请规则初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 初始化健身餐分类 ==========\n');

  // 初始化健身餐分类
  try {
    const db = getTCBApp().database();
    const mealCategoriesCollection = db.collection('meal_categories');

    // 检查是否已有数据
    const existingCategories = await mealCategoriesCollection.count();
    if ((existingCategories.total || 0) > 0) {
      console.log('⏭️ 健身餐分类已存在，跳过初始化');
    } else {
      const mealCategories = [
        {
          id: uuid(),
          name: '早餐',
          description: '营养早餐，开启活力一天',
          icon: '🌅',
          sort: 1,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '午餐',
          description: '均衡午餐，补充能量',
          icon: '☀️',
          sort: 2,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '晚餐',
          description: '清淡晚餐，健康睡眠',
          icon: '🌙',
          sort: 3,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '加餐',
          description: '健康加餐，补充营养',
          icon: '🍎',
          sort: 4,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const category of mealCategories) {
        await mealCategoriesCollection.add(category);
      }

      console.log('✅ 健身餐分类初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 初始化品牌信息 ==========\n');

  // 初始化品牌信息
  try {
    const db = getTCBApp().database();
    const brandInfoCollection = db.collection('brand_info');

    // 检查是否已有数据
    const existingBrand = await brandInfoCollection.count();
    if ((existingBrand.total || 0) > 0) {
      console.log('⏭️ 品牌信息已存在，跳过初始化');
    } else {
      const brandInfo = {
        name: 'RocketBird',
        description: '专业的健身健康管理平台，为您提供全方位的健康服务',
        logo: '/static/logo.png',
        website: 'https://rocketbird.com',
        contact: {
          phone: '400-888-8888',
          email: 'service@rocketbird.com',
          address: '北京市朝阳区建国门外大街1号',
        },
        social: {
          wechat: 'rocketbird_official',
          weibo: 'rocketbird',
          douyin: 'rocketbird',
        },
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await brandInfoCollection.add(brandInfo);
      console.log('✅ 品牌信息初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 初始化横幅 ==========\n');

  // 初始化横幅
  try {
    const db = getTCBApp().database();
    const bannersCollection = db.collection('banners');

    // 检查是否已有数据
    const existingBanners = await bannersCollection.count();
    if ((existingBanners.total || 0) > 0) {
      console.log('⏭️ 横幅已存在，跳过初始化');
    } else {
      const banners = [
        {
          id: uuid(),
          title: '新用户注册',
          description: '注册即送100积分',
          image: '/static/banner1.jpg',
          link: '/register',
          sort: 1,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          title: '健身餐推荐',
          description: '专业营养师定制健身餐',
          image: '/static/banner2.jpg',
          link: '/meals',
          sort: 2,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          title: '积分商城',
          description: '用积分兑换优质商品',
          image: '/static/banner3.jpg',
          link: '/points',
          sort: 3,
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const banner of banners) {
        await bannersCollection.add(banner);
      }

      console.log('✅ 横幅初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 初始化福利规则 ==========\n');

  // 初始化福利规则
  try {
    const db = getTCBApp().database();
    const benefitRulesCollection = db.collection('benefit_rules');

    // 检查是否已有数据
    const existingRules = await benefitRulesCollection.count();
    if ((existingRules.total || 0) > 0) {
      console.log('⏭️ 福利规则已存在，跳过初始化');
    } else {
      const benefitRules = [
        {
          id: uuid(),
          name: '新用户福利',
          description: '新注册用户赠送100积分',
          type: 'register',
          value: 100,
          conditions: '首次注册',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '每日打卡',
          description: '每日首次打卡赠送积分',
          type: 'checkin',
          value: 10,
          conditions: '每日首次打卡',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '连续打卡奖励',
          description: '连续7天打卡额外奖励',
          type: 'continuous_checkin',
          value: 50,
          conditions: '连续7天打卡',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
          name: '邀请奖励',
          description: '邀请好友注册并完成首次打卡',
          type: 'invite',
          value: 20,
          conditions: '被邀请人完成首次打卡',
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const rule of benefitRules) {
        await benefitRulesCollection.add(rule);
      }

      console.log('✅ 福利规则初始化成功');
    }
  } catch (error) {
    console.log(`❌ 初始化失败: ${String(error)}`);
  }

  console.log('\n========== 数据库初始化完成 ==========\n');
  console.log('✅ 所有集合和基础数据已初始化完成');
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error('❌ 数据库初始化失败:', error);
  process.exit(1);
});