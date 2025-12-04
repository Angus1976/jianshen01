"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = exports.BrandStore = exports.BrandArticle = exports.BrandInfo = void 0;
const base_repository_1 = require("../utils/base-repository");
class BrandInfoRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('brand_info');
    }
    async getMainBrand() {
        const { data } = await this.collection.limit(1).get();
        return data[0] || null;
    }
}
exports.BrandInfo = new BrandInfoRepository();
class BrandArticleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('brand_articles');
    }
    async findByArticleId(articleId) {
        return this.findOne({ articleId });
    }
    async findByCategory(category) {
        const { data } = await this.collection
            .where({ category, status: 1 })
            .orderBy('isTop', 'desc')
            .orderBy('publishAt', 'desc')
            .get();
        return data;
    }
    async findPublished() {
        const { data } = await this.collection
            .where({ status: 1 })
            .orderBy('isTop', 'desc')
            .orderBy('publishAt', 'desc')
            .get();
        return data;
    }
    async incrementViewCount(articleId) {
        var _a;
        const result = await this.collection.where({ articleId }).update({
            viewCount: this.cmd.inc(1),
        });
        return ((_a = result.updated) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.BrandArticle = new BrandArticleRepository();
class BrandStoreRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('brand_stores');
    }
    async findByStoreId(storeId) {
        return this.findOne({ storeId });
    }
    async findActiveStores() {
        const { data } = await this.collection
            .where({ status: 1 })
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
}
exports.BrandStore = new BrandStoreRepository();
class BannerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('banners');
    }
    async findByBannerId(bannerId) {
        return this.findOne({ bannerId });
    }
    async findByPosition(position) {
        const now = new Date();
        const { data } = await this.collection
            .where({
            position,
            status: 1,
        })
            .orderBy('sortOrder', 'asc')
            .get();
        // 过滤有效期内的轮播图
        return data.filter((banner) => {
            if (banner.startAt && new Date(banner.startAt) > now)
                return false;
            if (banner.endAt && new Date(banner.endAt) < now)
                return false;
            return true;
        });
    }
}
exports.Banner = new BannerRepository();
