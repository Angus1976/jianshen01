"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const brand_model_1 = require("../models/brand.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// GET /api/brand/info - 获取品牌信息
router.get('/info', async (req, res, next) => {
    try {
        const brand = await brand_model_1.BrandInfo.getMainBrand();
        if (!brand) {
            return (0, response_1.success)(res, {
                name: 'RocketBird',
                logo: '',
                slogan: '',
                description: '',
            });
        }
        (0, response_1.success)(res, {
            brandId: brand.brandId,
            name: brand.name,
            logo: brand.logo,
            slogan: brand.slogan,
            description: brand.description,
            contactPhone: brand.contactPhone,
            contactEmail: brand.contactEmail,
            wechatQrCode: brand.wechatQrCode,
            socialLinks: brand.socialLinks,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/brand/articles - 获取品牌文章列表
router.get('/articles', async (req, res, next) => {
    try {
        const { category, page = 1, pageSize = 20 } = req.query;
        let articles;
        if (category && typeof category === 'string') {
            articles = await brand_model_1.BrandArticle.findByCategory(category);
        }
        else {
            articles = await brand_model_1.BrandArticle.findPublished();
        }
        // 手动分页
        const total = articles.length;
        const start = (Number(page) - 1) * Number(pageSize);
        const end = start + Number(pageSize);
        const paginatedArticles = articles.slice(start, end);
        const formattedArticles = paginatedArticles.map(article => ({
            articleId: article.articleId,
            title: article.title,
            summary: article.summary,
            coverImage: article.coverImage,
            category: article.category,
            tags: article.tags,
            viewCount: article.viewCount,
            isTop: article.isTop,
            publishAt: article.publishAt,
        }));
        (0, response_1.paginated)(res, formattedArticles, total, Number(page), Number(pageSize));
    }
    catch (err) {
        next(err);
    }
});
// GET /api/brand/articles/:articleId - 获取文章详情
router.get('/articles/:articleId', async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const article = await brand_model_1.BrandArticle.findByArticleId(articleId);
        if (!article) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '文章不存在', 404);
        }
        if (article.status !== 1) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '文章已下架', 404);
        }
        // 增加阅读量
        await brand_model_1.BrandArticle.incrementViewCount(articleId);
        (0, response_1.success)(res, {
            articleId: article.articleId,
            title: article.title,
            summary: article.summary,
            coverImage: article.coverImage,
            content: article.content,
            category: article.category,
            tags: article.tags,
            viewCount: article.viewCount + 1,
            publishAt: article.publishAt,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/brand/stores - 获取门店列表
router.get('/stores', async (req, res, next) => {
    try {
        const { latitude, longitude } = req.query;
        const stores = await brand_model_1.BrandStore.findActiveStores();
        // 如果提供了位置信息，计算距离并排序
        let formattedStores = stores.map(store => {
            const storeData = {
                storeId: store.storeId,
                name: store.name,
                address: store.address,
                phone: store.phone,
                businessHours: store.businessHours,
                latitude: store.latitude,
                longitude: store.longitude,
                images: store.images,
                facilities: store.facilities,
                description: store.description,
            };
            // 计算距离 (简单的球面距离公式)
            if (latitude && longitude) {
                const lat1 = Number(latitude);
                const lon1 = Number(longitude);
                const lat2 = store.latitude;
                const lon2 = store.longitude;
                if (lat2 && lon2) {
                    const R = 6371; // 地球半径(公里)
                    const dLat = ((lat2 - lat1) * Math.PI) / 180;
                    const dLon = ((lon2 - lon1) * Math.PI) / 180;
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos((lat1 * Math.PI) / 180) *
                            Math.cos((lat2 * Math.PI) / 180) *
                            Math.sin(dLon / 2) *
                            Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    storeData.distance = Math.round(R * c * 1000); // 转换为米
                }
            }
            return storeData;
        });
        // 如果有距离信息，按距离排序
        if (latitude && longitude) {
            formattedStores = formattedStores.sort((a, b) => {
                var _a, _b;
                const distA = (_a = a.distance) !== null && _a !== void 0 ? _a : Infinity;
                const distB = (_b = b.distance) !== null && _b !== void 0 ? _b : Infinity;
                return distA - distB;
            });
        }
        (0, response_1.success)(res, formattedStores);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/brand/stores/:storeId - 获取门店详情
router.get('/stores/:storeId', async (req, res, next) => {
    try {
        const { storeId } = req.params;
        const store = await brand_model_1.BrandStore.findByStoreId(storeId);
        if (!store) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '门店不存在', 404);
        }
        if (store.status !== 1) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '门店已关闭', 404);
        }
        (0, response_1.success)(res, {
            storeId: store.storeId,
            name: store.name,
            address: store.address,
            phone: store.phone,
            businessHours: store.businessHours,
            latitude: store.latitude,
            longitude: store.longitude,
            images: store.images,
            facilities: store.facilities,
            description: store.description,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/brand/banners - 获取轮播图
router.get('/banners', async (req, res, next) => {
    try {
        const { position = 'home' } = req.query;
        const banners = await brand_model_1.Banner.findByPosition(position);
        const formattedBanners = banners.map(banner => ({
            bannerId: banner.bannerId,
            title: banner.title,
            image: banner.image,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
        }));
        (0, response_1.success)(res, formattedBanners);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
