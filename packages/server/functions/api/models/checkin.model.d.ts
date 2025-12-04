import { BaseRepository } from '../utils/base-repository';
export interface ICheckinTheme {
    _id?: string;
    themeId: string;
    name: string;
    description: string;
    coverImage: string;
    bgImage?: string;
    templateImages: string[];
    stickerImages: string[];
    rewardPoints: number;
    shareRewardPoints: number;
    maxDailyCheckin: number;
    sortOrder: number;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class CheckinThemeRepository extends BaseRepository<ICheckinTheme> {
    constructor();
    findByThemeId(themeId: string): Promise<ICheckinTheme | null>;
    findActiveThemes(): Promise<ICheckinTheme[]>;
}
export declare const CheckinTheme: CheckinThemeRepository;
export interface ICheckinRecord {
    _id?: string;
    recordId: string;
    userId: string;
    userNickname: string;
    userAvatar: string;
    themeId: string;
    themeName: string;
    content?: string;
    images: string[];
    location?: {
        name: string;
        latitude: number;
        longitude: number;
    };
    posterUrl?: string;
    rewardPoints: number;
    shareRewardPoints: number;
    isShared: boolean;
    sharedAt?: Date;
    shareCount: number;
    reviewStatus: number;
    reviewReason?: string;
    reviewedAt?: Date;
    reviewedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class CheckinRecordRepository extends BaseRepository<ICheckinRecord> {
    constructor();
    findByRecordId(recordId: string): Promise<ICheckinRecord | null>;
    findByUserId(userId: string, limit?: number): Promise<ICheckinRecord[]>;
    findByThemeId(themeId: string, limit?: number): Promise<ICheckinRecord[]>;
    getUserTodayCheckinCount(userId: string, themeId: string): Promise<number>;
    markAsShared(recordId: string): Promise<boolean>;
}
export declare const CheckinRecord: CheckinRecordRepository;
export interface IShareRule {
    _id?: string;
    ruleId: string;
    name: string;
    description: string;
    rewardPoints: number;
    dailyLimit: number;
    totalLimit: number;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class ShareRuleRepository extends BaseRepository<IShareRule> {
    constructor();
    findActiveRule(): Promise<IShareRule | null>;
}
export declare const ShareRule: ShareRuleRepository;
export {};
//# sourceMappingURL=checkin.model.d.ts.map