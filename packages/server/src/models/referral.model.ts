import { BaseRepository } from '../utils/base-repository';

// 邀请记录
export interface IInviteRecord {
  _id?: string;
  recordId: string;
  inviterId: string;
  inviterNickname: string;
  inviteeId: string;
  inviteeNickname: string;
  inviteePhone?: string;
  inviteCode: string;
  rewardPoints: number;
  status: number; // 0待奖励 1已奖励 2已失效
  rewardedAt?: Date;
  createdAt?: Date;
}

class InviteRecordRepository extends BaseRepository<IInviteRecord> {
  constructor() {
    super('invite_records');
  }

  async findByRecordId(recordId: string): Promise<IInviteRecord | null> {
    return this.findOne({ recordId });
  }

  async findByInviterId(inviterId: string): Promise<IInviteRecord[]> {
    const { data } = await this.collection
      .where({ inviterId })
      .orderBy('createdAt', 'desc')
      .get();
    return data as IInviteRecord[];
  }

  async findByInviteeId(inviteeId: string): Promise<IInviteRecord | null> {
    return this.findOne({ inviteeId });
  }

  async countByInviterId(inviterId: string): Promise<number> {
    const result = await this.collection.where({ inviterId }).count();
    return result.total ?? 0;
  }

  async countTodayByInviterId(inviterId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await this.collection
      .where({
        inviterId,
        createdAt: this.cmd.gte(today).and(this.cmd.lt(tomorrow)),
      })
      .count();
    return result.total ?? 0;
  }
}

export const InviteRecord = new InviteRecordRepository();

// 邀请规则
export interface IInviteRule {
  _id?: string;
  ruleId: string;
  name: string;
  description: string;
  inviterReward: number;
  inviteeReward: number;
  rewardCondition: string; // register/first_purchase
  maxInvitesPerDay: number; // 0=不限
  maxInvitesTotal: number; // 0=不限
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class InviteRuleRepository extends BaseRepository<IInviteRule> {
  constructor() {
    super('invite_rules');
  }

  async findActiveRule(): Promise<IInviteRule | null> {
    return this.findOne({ status: 1 });
  }
}

export const InviteRule = new InviteRuleRepository();
