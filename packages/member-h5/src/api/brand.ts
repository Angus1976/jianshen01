import { get } from '@/utils/request';

// 获取品牌信息
export const getBrandInfo = () => {
  return get<{
    brandId?: string;
    name: string;
    logo: string;
    slogan: string;
    description: string;
    contactPhone?: string;
    contactEmail?: string;
    wechatQrCode?: string;
    socialLinks?: { platform: string; url: string }[];
  }>('/brand/info');
};

// 获取品牌文章列表
export const getBrandArticles = (params?: { category?: string; page?: number; pageSize?: number }) => {
  return get<{
    list: {
      articleId: string;
      title: string;
      summary: string;
      coverImage: string;
      category: string;
      viewCount: number;
    }[];
    total: number;
    page: number;
    pageSize: number;
  }>('/brand/articles', params);
};

// 获取文章详情
export const getBrandArticleDetail = (articleId: string) => {
  return get<{
    articleId: string;
    title: string;
    summary: string;
    coverImage: string;
    content: string;
    category: string;
    tags: string[];
    viewCount: number;
    publishAt: string;
  }>(`/brand/articles/${articleId}`);
};

// 获取门店列表
export const getBrandStores = (params?: { latitude?: number; longitude?: number }) => {
  return get<{
    storeId: string;
    name: string;
    address: string;
    phone: string;
    businessHours: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
  }[]>('/brand/stores', params);
};

// 获取门店详情
export const getBrandStoreDetail = (storeId: string) => {
  return get<{
    storeId: string;
    name: string;
    address: string;
    phone: string;
    businessHours: string;
    latitude?: number;
    longitude?: number;
    images: string[];
    facilities: string[];
    description: string;
  }>(`/brand/stores/${storeId}`);
};

// 获取轮播图
export const getBanners = (position: string = 'home') => {
  return get<{
    bannerId: string;
    title: string;
    image: string;
    linkType: string;
    linkUrl: string;
  }[]>('/brand/banners', { position });
};
