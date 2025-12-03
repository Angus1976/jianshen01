import { BaseRepository } from '../utils/base-repository';

// 打卡主题
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
  status: number; // 0禁用 1启用
  createdAt?: Date;
  updatedAt?: Date;
}

class CheckinThemeRepository extends BaseRepository<ICheckinTheme> {
  constructor() {
    super('checkin_themes');
  }

  async findByThemeId(themeId: string): Promise<ICheckinTheme | null> {
    return this.findOne({ themeId });
  }

  async findActiveThemes(): Promise<ICheckinTheme[]> {
    const { data } = await this.collection
      .where({ status: 1 })
      .orderBy('sortOrder', 'asc')
      .get();
    return data as ICheckinTheme[];
  }
}

export const CheckinTheme = new CheckinThemeRepository();

// 打卡记录
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
  reviewStatus: number; // 0待审核 1通过 2拒绝
  reviewReason?: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class CheckinRecordRepository extends BaseRepository<ICheckinRecord> {
  constructor() {
    super('checkin_records');
  }

  async findByRecordId(recordId: string): Promise<ICheckinRecord | null> {
    return this.findOne({ recordId });
  }

  async findByUserId(userId: string, limit = 20): Promise<ICheckinRecord[]> {
    const { data } = await this.collection
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return data as ICheckinRecord[];
  }

  async findByThemeId(themeId: string, limit = 20): Promise<ICheckinRecord[]> {
    const { data } = await this.collection
      .where({ themeId, reviewStatus: 1 })
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return data as ICheckinRecord[];
  }

  // 获取用户今日打卡次数
  async getUserTodayCheckinCount(userId: string, themeId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await this.collection
      .where({
        userId,
        themeId,
        createdAt: this.cmd.gte(today).and(this.cmd.lt(tomorrow)),
      })
      .count();
    return result.total ?? 0;
  }

  // 标记为已分享
  async markAsShared(recordId: string): Promise<boolean> {
    const record = await this.findByRecordId(recordId);
    if (!record) return false;
    return this.updateById(record._id!, {
      isShared: true,
      sharedAt: new Date(),
      shareCount: (record.shareCount || 0) + 1,
    } as Partial<ICheckinRecord>);
  }
}

export const CheckinRecord = new CheckinRecordRepository();

// 分享规则
export interface IShareRule {
  _id?: string;
  ruleId: string;
  name: string;
  description: string;
  rewardPoints: number;
  dailyLimit: number; // 0=不限制
  totalLimit: number; // 0=不限制
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class ShareRuleRepository extends BaseRepository<IShareRule> {
  constructor() {
    super('share_rules');
  }

  async findActiveRule(): Promise<IShareRule | null> {
    return this.findOne({ status: 1 });
  }
}

export const ShareRule = new ShareRuleRepository();
