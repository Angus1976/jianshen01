"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const admin_auth_middleware_1 = require("../../middlewares/admin-auth.middleware");
const response_1 = require("../../utils/response");
const brand_model_1 = require("../../models/brand.model");
const shared_1 = require("@rocketbird/shared");
const router = (0, express_1.Router)();
// ==================== 品牌信息 ====================
// GET /api/admin/brand/info - 获取品牌信息
router.get('/info', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const brand = await brand_model_1.BrandInfo.getMainBrand();
        (0, response_1.success)(res, brand || {});
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/brand/info - 更新品牌信息
router.put('/info', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, logo, slogan, description, contactPhone, contactEmail, wechatQrCode, socialLinks } = req.body;
        let brand = await brand_model_1.BrandInfo.getMainBrand();
        if (brand) {
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (logo !== undefined)
                updateData.logo = logo;
            if (slogan !== undefined)
                updateData.slogan = slogan;
            if (description !== undefined)
                updateData.description = description;
            if (contactPhone !== undefined)
                updateData.contactPhone = contactPhone;
            if (contactEmail !== undefined)
                updateData.contactEmail = contactEmail;
            if (wechatQrCode !== undefined)
                updateData.wechatQrCode = wechatQrCode;
            if (socialLinks !== undefined)
                updateData.socialLinks = socialLinks;
            await brand_model_1.BrandInfo.updateById(brand._id, updateData);
        }
        else {
            brand = await brand_model_1.BrandInfo.create({
                brandId: (0, uuid_1.v4)(),
                name: name || '',
                logo: logo || '',
                slogan: slogan || '',
                description: description || '',
                contactPhone,
                contactEmail,
                wechatQrCode,
                socialLinks,
            });
        }
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== 品牌文章 ====================
// GET /api/admin/brand/articles - 获取品牌文章列表
router.get('/articles', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, keyword, category, status } = req.query;
        const query = {};
        if (keyword) {
            query.title = new RegExp(keyword, 'i');
        }
        if (category) {
            query.category = category;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await brand_model_1.BrandArticle.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'publishAt', direction: 'desc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/brand/articles - 创建品牌文章
router.post('/articles', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { title, summary, coverImage, content, category, tags, isTop, sortOrder, status } = req.body;
        if (!title || !content) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '标题和内容不能为空');
        }
        const article = await brand_model_1.BrandArticle.create({
            articleId: (0, uuid_1.v4)(),
            title,
            summary,
            coverImage: coverImage || '',
            content,
            category: category || 'news',
            tags: tags || [],
            viewCount: 0,
            isTop: isTop || false,
            sortOrder: sortOrder || 0,
            status: status || 0,
            publishAt: status === 1 ? new Date() : new Date(),
        });
        (0, response_1.success)(res, article, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/brand/articles/:articleId - 更新品牌文章
router.put('/articles/:articleId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const updateFields = req.body;
        const article = await brand_model_1.BrandArticle.findByArticleId(articleId);
        if (!article) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '文章不存在', 404);
        }
        const updateData = {};
        const allowedFields = [
            'title', 'summary', 'coverImage', 'content', 'category',
            'tags', 'isTop', 'sortOrder', 'status',
        ];
        for (const field of allowedFields) {
            if (updateFields[field] !== undefined) {
                updateData[field] = updateFields[field];
            }
        }
        // 如果发布，更新发布时间
        if (updateFields.status === 1 && article.status === 0) {
            updateData.publishAt = new Date();
        }
        await brand_model_1.BrandArticle.updateById(article._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/brand/articles/:articleId - 删除品牌文章
router.delete('/articles/:articleId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const article = await brand_model_1.BrandArticle.findByArticleId(articleId);
        if (!article) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '文章不存在', 404);
        }
        await brand_model_1.BrandArticle.deleteById(article._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== 门店管理 ====================
// GET /api/admin/brand/stores - 获取门店列表
router.get('/stores', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, keyword, status } = req.query;
        const query = {};
        if (keyword) {
            query.name = new RegExp(keyword, 'i');
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await brand_model_1.BrandStore.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/brand/stores - 创建门店
router.post('/stores', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { name, address, phone, businessHours, latitude, longitude, images, facilities, description, sortOrder, } = req.body;
        if (!name || !address) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '门店名称和地址不能为空');
        }
        const store = await brand_model_1.BrandStore.create({
            storeId: (0, uuid_1.v4)(),
            name,
            address,
            phone: phone || '',
            businessHours: businessHours || '',
            latitude: latitude || 0,
            longitude: longitude || 0,
            images: images || [],
            facilities: facilities || [],
            description,
            sortOrder: sortOrder || 0,
            status: 1,
        });
        (0, response_1.success)(res, store, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/brand/stores/:storeId - 更新门店
router.put('/stores/:storeId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { storeId } = req.params;
        const updateFields = req.body;
        const store = await brand_model_1.BrandStore.findByStoreId(storeId);
        if (!store) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '门店不存在', 404);
        }
        const updateData = {};
        const allowedFields = [
            'name', 'address', 'phone', 'businessHours',
            'latitude', 'longitude', 'images', 'facilities',
            'description', 'sortOrder', 'status',
        ];
        for (const field of allowedFields) {
            if (updateFields[field] !== undefined) {
                updateData[field] = updateFields[field];
            }
        }
        await brand_model_1.BrandStore.updateById(store._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/brand/stores/:storeId - 删除门店
router.delete('/stores/:storeId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { storeId } = req.params;
        const store = await brand_model_1.BrandStore.findByStoreId(storeId);
        if (!store) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '门店不存在', 404);
        }
        await brand_model_1.BrandStore.deleteById(store._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
// ==================== 轮播图管理 ====================
// GET /api/admin/brand/banners - 获取轮播图列表
router.get('/banners', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { page = 1, pageSize = 20, position, status } = req.query;
        const query = {};
        if (position) {
            query.position = position;
        }
        if (status !== undefined && status !== '') {
            query.status = Number(status);
        }
        const result = await brand_model_1.Banner.findPaginated(query, { page: Number(page), pageSize: Number(pageSize) }, { field: 'sortOrder', direction: 'asc' });
        (0, response_1.paginated)(res, result.list, result.total, result.page, result.pageSize);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/admin/brand/banners - 创建轮播图
router.post('/banners', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { title, image, linkType, linkUrl, position, sortOrder, startAt, endAt } = req.body;
        if (!title || !image) {
            return (0, response_1.error)(res, shared_1.ApiCode.BadRequest, '标题和图片不能为空');
        }
        const banner = await brand_model_1.Banner.create({
            bannerId: (0, uuid_1.v4)(),
            title,
            image,
            linkType: linkType || 'none',
            linkUrl,
            position: position || 'home',
            sortOrder: sortOrder || 0,
            startAt: startAt ? new Date(startAt) : undefined,
            endAt: endAt ? new Date(endAt) : undefined,
            status: 1,
        });
        (0, response_1.success)(res, banner, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/admin/brand/banners/:bannerId - 更新轮播图
router.put('/banners/:bannerId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { bannerId } = req.params;
        const updateFields = req.body;
        const banner = await brand_model_1.Banner.findByBannerId(bannerId);
        if (!banner) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '轮播图不存在', 404);
        }
        const updateData = {};
        const allowedFields = [
            'title', 'image', 'linkType', 'linkUrl',
            'position', 'sortOrder', 'status',
        ];
        for (const field of allowedFields) {
            if (updateFields[field] !== undefined) {
                updateData[field] = updateFields[field];
            }
        }
        if (updateFields.startAt !== undefined) {
            updateData.startAt = updateFields.startAt ? new Date(updateFields.startAt) : undefined;
        }
        if (updateFields.endAt !== undefined) {
            updateData.endAt = updateFields.endAt ? new Date(updateFields.endAt) : undefined;
        }
        await brand_model_1.Banner.updateById(banner._id, updateData);
        (0, response_1.success)(res, { message: '更新成功' });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/admin/brand/banners/:bannerId - 删除轮播图
router.delete('/banners/:bannerId', admin_auth_middleware_1.adminAuthMiddleware, async (req, res, next) => {
    try {
        const { bannerId } = req.params;
        const banner = await brand_model_1.Banner.findByBannerId(bannerId);
        if (!banner) {
            return (0, response_1.error)(res, shared_1.ApiCode.NotFound, '轮播图不存在', 404);
        }
        await brand_model_1.Banner.deleteById(banner._id);
        (0, response_1.success)(res, { message: '删除成功' });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
