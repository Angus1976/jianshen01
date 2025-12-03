import { BaseRepository } from '../utils/base-repository';

// 福利规则
export interface IBenefitRule {
  _id?: string;
  ruleId: string;
  name: string;
  type: string; // birthday/growth/new_member/level_upgrade
  description: string;
  rewardType: string; // points/coupon/gift
  rewardValue: number;
  rewardUnit: string;
  conditions: {
    levelIds?: string[];
    minGrowth?: number;
    isNewMember?: boolean;
    memberDays?: number;
  };
  validDays: number;
  autoGrant: boolean;
  sortOrder: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class BenefitRuleRepository extends BaseRepository<IBenefitRule> {
  constructor() {
    super('benefit_rules');
  }

  async findByRuleId(ruleId: string): Promise<IBenefitRule | null> {
    return this.findOne({ ruleId });
  }

  async findActiveRules(): Promise<IBenefitRule[]> {
    const { data } = await this.collection
      .where({ status: 1 })
      .orderBy('sortOrder', 'asc')
      .get();
    return data as IBenefitRule[];
  }

  async findByType(type: string): Promise<IBenefitRule[]> {
    const { data } = await this.collection
      .where({ type, status: 1 })
      .get();
    return data as IBenefitRule[];
  }
}

export const BenefitRule = new BenefitRuleRepository();

// 福利记录
export interface IBenefitRecord {
  _id?: string;
  recordId: string;
  userId: string;
  userNickname: string;
  ruleId: string;
  ruleName: string;
  type: string;
  rewardType: string;
  rewardValue: number;
  rewardUnit: string;
  status: number; // 0待领取 1已领取 2已使用 3已过期
  claimedAt?: Date;
  usedAt?: Date;
  expireAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class BenefitRecordRepository extends BaseRepository<IBenefitRecord> {
  constructor() {
    super('benefit_records');
  }

  async findByRecordId(recordId: string): Promise<IBenefitRecord | null> {
    return this.findOne({ recordId });
  }

  async findByUserId(userId: string): Promise<IBenefitRecord[]> {
    const { data } = await this.collection
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .get();
    return data as IBenefitRecord[];
  }

  async findPendingByUserId(userId: string): Promise<IBenefitRecord[]> {
    const { data } = await this.collection
      .where({ userId, status: 0 })
      .orderBy('expireAt', 'asc')
      .get();
    return data as IBenefitRecord[];
  }
}

export const BenefitRecord = new BenefitRecordRepository();
