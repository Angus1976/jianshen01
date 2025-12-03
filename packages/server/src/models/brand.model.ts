import { BaseRepository } from '../utils/base-repository';

// 品牌信息
export interface IBrandInfo {
  _id?: string;
  brandId: string;
  name: string;
  logo: string;
  slogan: string;
  description: string;
  contactPhone?: string;
  contactEmail?: string;
  wechatQrCode?: string;
  socialLinks?: {
    wechat?: string;
    weibo?: string;
    douyin?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

class BrandInfoRepository extends BaseRepository<IBrandInfo> {
  constructor() {
    super('brand_info');
  }

  async getMainBrand(): Promise<IBrandInfo | null> {
    const { data } = await this.collection.limit(1).get();
    return (data[0] as IBrandInfo) || null;
  }
}

export const BrandInfo = new BrandInfoRepository();

// 品牌文章
export interface IBrandArticle {
  _id?: string;
  articleId: string;
  title: string;
  summary?: string;
  coverImage: string;
  content: string;
  category: string; // news/activity/knowledge
  tags: string[];
  viewCount: number;
  isTop: boolean;
  sortOrder: number;
  status: number; // 0草稿 1发布
  publishAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class BrandArticleRepository extends BaseRepository<IBrandArticle> {
  constructor() {
    super('brand_articles');
  }

  async findByArticleId(articleId: string): Promise<IBrandArticle | null> {
    return this.findOne({ articleId });
  }

  async findByCategory(category: string): Promise<IBrandArticle[]> {
    const { data } = await this.collection
      .where({ category, status: 1 })
      .orderBy('isTop', 'desc')
      .orderBy('publishAt', 'desc')
      .get();
    return data as IBrandArticle[];
  }

  async findPublished(): Promise<IBrandArticle[]> {
    const { data } = await this.collection
      .where({ status: 1 })
      .orderBy('isTop', 'desc')
      .orderBy('publishAt', 'desc')
      .get();
    return data as IBrandArticle[];
  }

  async incrementViewCount(articleId: string): Promise<boolean> {
    const result = await this.collection.where({ articleId }).update({
      viewCount: this.cmd.inc(1),
    });
    return (result.updated ?? 0) > 0;
  }
}

export const BrandArticle = new BrandArticleRepository();

// 门店信息
export interface IBrandStore {
  _id?: string;
  storeId: string;
  name: string;
  address: string;
  phone: string;
  businessHours: string;
  latitude: number;
  longitude: number;
  images: string[];
  facilities: string[];
  description?: string;
  sortOrder: number;
  status: number; // 0关闭 1营业
  createdAt?: Date;
  updatedAt?: Date;
}

class BrandStoreRepository extends BaseRepository<IBrandStore> {
  constructor() {
    super('brand_stores');
  }

  async findByStoreId(storeId: string): Promise<IBrandStore | null> {
    return this.findOne({ storeId });
  }

  async findActiveStores(): Promise<IBrandStore[]> {
    const { data } = await this.collection
      .where({ status: 1 })
      .orderBy('sortOrder', 'asc')
      .get();
    return data as IBrandStore[];
  }
}

export const BrandStore = new BrandStoreRepository();

// 轮播图
export interface IBanner {
  _id?: string;
  bannerId: string;
  title: string;
  image: string;
  linkType: string; // none/page/article/url
  linkUrl?: string;
  position: string; // home/points/checkin
  sortOrder: number;
  startAt?: Date;
  endAt?: Date;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class BannerRepository extends BaseRepository<IBanner> {
  constructor() {
    super('banners');
  }

  async findByBannerId(bannerId: string): Promise<IBanner | null> {
    return this.findOne({ bannerId });
  }

  async findByPosition(position: string): Promise<IBanner[]> {
    const now = new Date();
    const { data } = await this.collection
      .where({
        position,
        status: 1,
      })
      .orderBy('sortOrder', 'asc')
      .get();

    // 过滤有效期内的轮播图
    return (data as IBanner[]).filter((banner) => {
      if (banner.startAt && new Date(banner.startAt) > now) return false;
      if (banner.endAt && new Date(banner.endAt) < now) return false;
      return true;
    });
  }
}

export const Banner = new BannerRepository();
