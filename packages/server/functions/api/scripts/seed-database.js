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
 * 初始化数据库集合和基础数据
 * 运行: yarn workspace @rocketbird/server seed:db
 */
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// 必须在其他模块导入前加载环境变量
const __dirname = path_1.default.dirname(__filename);
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../', envFile) });
console.log('TCB_SECRET_ID:', process.env.TCB_SECRET_ID);
console.log('TCB_SECRET_KEY:', process.env.TCB_SECRET_KEY ? '***' : 'undefined');
async function seedDatabase() {
    const { v4: uuid } = await Promise.resolve().then(() => __importStar(require('uuid')));
    const { connectDatabase, getTCBApp } = await Promise.resolve().then(() => __importStar(require('../config/database')));
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
    try {
        // 初始化 TCB
        await connectDatabase();
        const app = getTCBApp();
        const db = app.database();
        console.log('TCB 数据库连接成功\n');
        // 创建所有集合
        console.log('========== 创建集合 ==========\n');
        for (const collectionName of collections) {
            try {
                await app.database().createCollection(collectionName);
                console.log(`✅ 集合 ${collectionName} 创建成功`);
            }
            catch (err) {
                const error = err;
                if (error.code === 'DATABASE_COLLECTION_EXIST' ||
                    error.code === 'DATABASE_COLLECTION_ALREADY_EXIST') {
                    console.log(`⏭️  集合 ${collectionName} 已存在，跳过`);
                }
                else {
                    console.error(`❌ 创建集合 ${collectionName} 失败:`, error);
                }
            }
        }
        // 初始化等级规则
        console.log('\n========== 初始化等级规则 ==========\n');
        const levelRulesCollection = db.collection('level_rules');
        const { total: levelCount } = await levelRulesCollection.count();
        if (levelCount === 0) {
            const levelRules = [
                {
                    _id: uuid(),
                    levelId: uuid(),
                    name: '普通会员',
                    code: 'normal',
                    minGrowth: 0,
                    maxGrowth: 999,
                    icon: '',
                    color: '#999999',
                    benefits: ['基础会员权益'],
                    sortOrder: 1,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: uuid(),
                    levelId: uuid(),
                    name: '银卡会员',
                    code: 'silver',
                    minGrowth: 1000,
                    maxGrowth: 4999,
                    icon: '',
                    color: '#C0C0C0',
                    benefits: ['银卡专属折扣', '生日双倍积分'],
                    sortOrder: 2,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: uuid(),
                    levelId: uuid(),
                    name: '金卡会员',
                    code: 'gold',
                    minGrowth: 5000,
                    maxGrowth: 19999,
                    icon: '',
                    color: '#FFD700',
                    benefits: ['金卡专属折扣', '生日三倍积分', '专属客服'],
                    sortOrder: 3,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: uuid(),
                    levelId: uuid(),
                    name: '钻石会员',
                    code: 'diamond',
                    minGrowth: 20000,
                    maxGrowth: 999999999,
                    icon: '',
                    color: '#00BFFF',
                    benefits: ['钻石专属折扣', '生日四倍积分', '专属客服', 'VIP活动优先'],
                    sortOrder: 4,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            for (const rule of levelRules) {
                await levelRulesCollection.add(rule);
            }
            console.log('✅ 等级规则初始化成功（共4个等级）');
        }
        else {
            console.log('⏭️  等级规则已存在，跳过');
        }
        // 初始化打卡主题
        console.log('\n========== 初始化打卡主题 ==========\n');
        const checkinThemesCollection = db.collection('checkin_themes');
        const { total: themeCount } = await checkinThemesCollection.count();
        if (themeCount === 0) {
            const checkinThemes = [
                {
                    _id: uuid(),
                    themeId: uuid(),
                    name: '每日打卡',
                    description: '每日签到打卡，获取积分奖励',
                    coverImage: '',
                    bgImage: '',
                    templateImages: [],
                    stickerImages: [],
                    rewardPoints: 10,
                    shareRewardPoints: 5,
                    maxDailyCheckin: 1,
                    sortOrder: 1,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: uuid(),
                    themeId: uuid(),
                    name: '美食分享',
                    description: '分享美食照片，获取额外积分',
                    coverImage: '',
                    bgImage: '',
                    templateImages: [],
                    stickerImages: [],
                    rewardPoints: 20,
                    shareRewardPoints: 10,
                    maxDailyCheckin: 3,
                    sortOrder: 2,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            for (const theme of checkinThemes) {
                await checkinThemesCollection.add(theme);
            }
            console.log('✅ 打卡主题初始化成功（共2个主题）');
        }
        else {
            console.log('⏭️  打卡主题已存在，跳过');
        }
        // 初始化分享规则
        console.log('\n========== 初始化分享规则 ==========\n');
        const shareRulesCollection = db.collection('share_rules');
        const { total: shareRuleCount } = await shareRulesCollection.count();
        if (shareRuleCount === 0) {
            await shareRulesCollection.add({
                _id: uuid(),
                ruleId: uuid(),
                name: '默认分享规则',
                description: '分享内容到社交平台获取积分',
                rewardPoints: 5,
                dailyLimit: 3,
                totalLimit: 0,
                status: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✅ 分享规则初始化成功');
        }
        else {
            console.log('⏭️  分享规则已存在，跳过');
        }
        // 初始化品牌信息
        console.log('\n========== 初始化品牌信息 ==========\n');
        const brandInfoCollection = db.collection('brand_info');
        const { total: brandCount } = await brandInfoCollection.count();
        if (brandCount === 0) {
            await brandInfoCollection.add({
                _id: uuid(),
                brandId: uuid(),
                name: 'RocketBird',
                logo: '',
                slogan: '让美食更有温度',
                description: 'RocketBird 是一家专注于美食体验的品牌',
                contactPhone: '',
                contactEmail: '',
                wechatQrcode: '',
                status: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('✅ 品牌信息初始化成功');
        }
        else {
            console.log('⏭️  品牌信息已存在，跳过');
        }
        // 初始化健身餐分类
        console.log('\n========== 初始化健身餐分类 ==========\n');
        const mealCategoriesCollection = db.collection('meal_categories');
        const { total: mealCategoryCount } = await mealCategoriesCollection.count();
        if (mealCategoryCount === 0) {
            const mealCategories = [
                {
                    _id: uuid(),
                    categoryId: uuid(),
                    name: '增肌餐',
                    description: '高蛋白低脂肪，适合增肌训练',
                    icon: '',
                    sortOrder: 1,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: uuid(),
                    categoryId: uuid(),
                    name: '减脂餐',
                    description: '低卡路里，助力减脂',
                    icon: '',
                    sortOrder: 2,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: uuid(),
                    categoryId: uuid(),
                    name: '塑形餐',
                    description: '营养均衡，维持体形',
                    icon: '',
                    sortOrder: 3,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: uuid(),
                    categoryId: uuid(),
                    name: '轻食沙拉',
                    description: '新鲜蔬菜，清爽健康',
                    icon: '',
                    sortOrder: 4,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            for (const category of mealCategories) {
                await mealCategoriesCollection.add(category);
            }
            console.log('✅ 健身餐分类初始化成功（共4个分类）');
        }
        else {
            console.log('⏭️  健身餐分类已存在，跳过');
        }
        // 初始化示例积分商品
        console.log('\n========== 初始化积分商品 ==========\n');
        const pointsProductsCollection = db.collection('points_products');
        const { total: productCount } = await pointsProductsCollection.count();
        if (productCount === 0) {
            const products = [
                {
                    _id: uuid(),
                    productId: uuid(),
                    name: '10元优惠券',
                    description: '满50元可用',
                    coverImage: '',
                    images: [],
                    category: 'coupon',
                    pointsCost: 100,
                    originalPrice: 10,
                    stock: 999,
                    totalStock: 999,
                    limitPerUser: 5,
                    productType: 'coupon',
                    couponInfo: {
                        amount: 10,
                        minAmount: 50,
                        validDays: 30,
                    },
                    validDays: 30,
                    useRules: '满50元可用，不可与其他优惠叠加',
                    sortOrder: 1,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: uuid(),
                    productId: uuid(),
                    name: '20元优惠券',
                    description: '满100元可用',
                    coverImage: '',
                    images: [],
                    category: 'coupon',
                    pointsCost: 180,
                    originalPrice: 20,
                    stock: 999,
                    totalStock: 999,
                    limitPerUser: 3,
                    productType: 'coupon',
                    couponInfo: {
                        amount: 20,
                        minAmount: 100,
                        validDays: 30,
                    },
                    validDays: 30,
                    useRules: '满100元可用，不可与其他优惠叠加',
                    sortOrder: 2,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            for (const product of products) {
                await pointsProductsCollection.add(product);
            }
            console.log('✅ 积分商品初始化成功（共2个商品）');
        }
        else {
            console.log('⏭️  积分商品已存在，跳过');
        }
        console.log('\n========================================');
        console.log('  数据库初始化完成！');
        console.log('========================================\n');
        console.log('提示: 如需初始化管理员账号，请运行:');
        console.log('  yarn workspace @rocketbird/server seed:admin\n');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ 初始化失败:', error);
        process.exit(1);
    }
}
seedDatabase();
