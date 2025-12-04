import { BaseRepository } from '../utils/base-repository';
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
declare class BrandInfoRepository extends BaseRepository<IBrandInfo> {
    constructor();
    getMainBrand(): Promise<IBrandInfo | null>;
}
export declare const BrandInfo: BrandInfoRepository;
export interface IBrandArticle {
    _id?: string;
    articleId: string;
    title: string;
    summary?: string;
    coverImage: string;
    content: string;
    category: string;
    tags: string[];
    viewCount: number;
    isTop: boolean;
    sortOrder: number;
    status: number;
    publishAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class BrandArticleRepository extends BaseRepository<IBrandArticle> {
    constructor();
    findByArticleId(articleId: string): Promise<IBrandArticle | null>;
    findByCategory(category: string): Promise<IBrandArticle[]>;
    findPublished(): Promise<IBrandArticle[]>;
    incrementViewCount(articleId: string): Promise<boolean>;
}
export declare const BrandArticle: BrandArticleRepository;
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
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class BrandStoreRepository extends BaseRepository<IBrandStore> {
    constructor();
    findByStoreId(storeId: string): Promise<IBrandStore | null>;
    findActiveStores(): Promise<IBrandStore[]>;
}
export declare const BrandStore: BrandStoreRepository;
export interface IBanner {
    _id?: string;
    bannerId: string;
    title: string;
    image: string;
    linkType: string;
    linkUrl?: string;
    position: string;
    sortOrder: number;
    startAt?: Date;
    endAt?: Date;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class BannerRepository extends BaseRepository<IBanner> {
    constructor();
    findByBannerId(bannerId: string): Promise<IBanner | null>;
    findByPosition(position: string): Promise<IBanner[]>;
}
export declare const Banner: BannerRepository;
export {};
//# sourceMappingURL=brand.model.d.ts.map