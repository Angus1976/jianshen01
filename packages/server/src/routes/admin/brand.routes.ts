import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { adminAuthMiddleware } from '../../middlewares/admin-auth.middleware';
import { success, error, paginated } from '../../utils/response';
import {
  BrandInfo,
  BrandArticle,
  BrandStore,
  Banner,
  IBrandInfo,
  IBrandArticle,
  IBrandStore,
  IBanner,
} from '../../models/brand.model';
import { ApiCode } from '@rocketbird/shared';

const router = Router();

// ==================== 品牌信息 ====================

// GET /api/admin/brand/info - 获取品牌信息
router.get('/info', adminAuthMiddleware, async (req, res, next) => {
  try {
    const brand = await BrandInfo.getMainBrand();
    success(res, brand || {});
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/brand/info - 更新品牌信息
router.put('/info', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { name, logo, slogan, description, contactPhone, contactEmail, wechatQrCode, socialLinks } = req.body;

    let brand = await BrandInfo.getMainBrand();

    if (brand) {
      const updateData: Partial<IBrandInfo> = {};
      if (name !== undefined) updateData.name = name;
      if (logo !== undefined) updateData.logo = logo;
      if (slogan !== undefined) updateData.slogan = slogan;
      if (description !== undefined) updateData.description = description;
      if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      if (wechatQrCode !== undefined) updateData.wechatQrCode = wechatQrCode;
      if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

      await BrandInfo.updateById(brand._id!, updateData);
    } else {
      brand = await BrandInfo.create({
        brandId: uuid(),
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

    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// ==================== 品牌文章 ====================

// GET /api/admin/brand/articles - 获取品牌文章列表
router.get('/articles', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, category, status } = req.query;

    const query: Record<string, unknown> = {};
    if (keyword) {
      query.title = new RegExp(keyword as string, 'i');
    }
    if (category) {
      query.category = category;
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await BrandArticle.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'publishAt', direction: 'desc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/brand/articles - 创建品牌文章
router.post('/articles', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { title, summary, coverImage, content, category, tags, isTop, sortOrder, status } = req.body;

    if (!title || !content) {
      return error(res, ApiCode.BadRequest, '标题和内容不能为空');
    }

    const article = await BrandArticle.create({
      articleId: uuid(),
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

    success(res, article, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/brand/articles/:articleId - 更新品牌文章
router.put('/articles/:articleId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const updateFields = req.body;

    const article = await BrandArticle.findByArticleId(articleId);
    if (!article) {
      return error(res, ApiCode.NotFound, '文章不存在', 404);
    }

    const updateData: Partial<IBrandArticle> = {};
    const allowedFields = [
      'title', 'summary', 'coverImage', 'content', 'category',
      'tags', 'isTop', 'sortOrder', 'status',
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = updateFields[field];
      }
    }

    // 如果发布，更新发布时间
    if (updateFields.status === 1 && article.status === 0) {
      updateData.publishAt = new Date();
    }

    await BrandArticle.updateById(article._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/brand/articles/:articleId - 删除品牌文章
router.delete('/articles/:articleId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const article = await BrandArticle.findByArticleId(articleId);
    if (!article) {
      return error(res, ApiCode.NotFound, '文章不存在', 404);
    }

    await BrandArticle.deleteById(article._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

// ==================== 门店管理 ====================

// GET /api/admin/brand/stores - 获取门店列表
router.get('/stores', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, status } = req.query;

    const query: Record<string, unknown> = {};
    if (keyword) {
      query.name = new RegExp(keyword as string, 'i');
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await BrandStore.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'sortOrder', direction: 'asc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/brand/stores - 创建门店
router.post('/stores', adminAuthMiddleware, async (req, res, next) => {
  try {
    const {
      name,
      address,
      phone,
      businessHours,
      latitude,
      longitude,
      images,
      facilities,
      description,
      sortOrder,
    } = req.body;

    if (!name || !address) {
      return error(res, ApiCode.BadRequest, '门店名称和地址不能为空');
    }

    const store = await BrandStore.create({
      storeId: uuid(),
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

    success(res, store, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/brand/stores/:storeId - 更新门店
router.put('/stores/:storeId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const updateFields = req.body;

    const store = await BrandStore.findByStoreId(storeId);
    if (!store) {
      return error(res, ApiCode.NotFound, '门店不存在', 404);
    }

    const updateData: Partial<IBrandStore> = {};
    const allowedFields = [
      'name', 'address', 'phone', 'businessHours',
      'latitude', 'longitude', 'images', 'facilities',
      'description', 'sortOrder', 'status',
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = updateFields[field];
      }
    }

    await BrandStore.updateById(store._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/brand/stores/:storeId - 删除门店
router.delete('/stores/:storeId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { storeId } = req.params;

    const store = await BrandStore.findByStoreId(storeId);
    if (!store) {
      return error(res, ApiCode.NotFound, '门店不存在', 404);
    }

    await BrandStore.deleteById(store._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

// ==================== 轮播图管理 ====================

// GET /api/admin/brand/banners - 获取轮播图列表
router.get('/banners', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, position, status } = req.query;

    const query: Record<string, unknown> = {};
    if (position) {
      query.position = position;
    }
    if (status !== undefined && status !== '') {
      query.status = Number(status);
    }

    const result = await Banner.findPaginated(
      query,
      { page: Number(page), pageSize: Number(pageSize) },
      { field: 'sortOrder', direction: 'asc' }
    );

    paginated(res, result.list, result.total, result.page, result.pageSize);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/brand/banners - 创建轮播图
router.post('/banners', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { title, image, linkType, linkUrl, position, sortOrder, startAt, endAt } = req.body;

    if (!title || !image) {
      return error(res, ApiCode.BadRequest, '标题和图片不能为空');
    }

    const banner = await Banner.create({
      bannerId: uuid(),
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

    success(res, banner, '创建成功');
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/brand/banners/:bannerId - 更新轮播图
router.put('/banners/:bannerId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { bannerId } = req.params;
    const updateFields = req.body;

    const banner = await Banner.findByBannerId(bannerId);
    if (!banner) {
      return error(res, ApiCode.NotFound, '轮播图不存在', 404);
    }

    const updateData: Partial<IBanner> = {};
    const allowedFields = [
      'title', 'image', 'linkType', 'linkUrl',
      'position', 'sortOrder', 'status',
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = updateFields[field];
      }
    }

    if (updateFields.startAt !== undefined) {
      updateData.startAt = updateFields.startAt ? new Date(updateFields.startAt) : undefined;
    }
    if (updateFields.endAt !== undefined) {
      updateData.endAt = updateFields.endAt ? new Date(updateFields.endAt) : undefined;
    }

    await Banner.updateById(banner._id!, updateData);
    success(res, { message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/brand/banners/:bannerId - 删除轮播图
router.delete('/banners/:bannerId', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { bannerId } = req.params;

    const banner = await Banner.findByBannerId(bannerId);
    if (!banner) {
      return error(res, ApiCode.NotFound, '轮播图不存在', 404);
    }

    await Banner.deleteById(banner._id!);
    success(res, { message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

export default router;
