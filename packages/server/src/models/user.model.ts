import { BaseRepository } from '../utils/base-repository';

// 用户类型定义
export interface IUser {
  _id?: string;
  userId: string;
  openId: string;
  unionId?: string;
  phone?: string;
  nickname: string;
  avatar: string;
  gender: number; // 0未知 1男 2女
  birthday?: Date;
  province?: string;
  city?: string;
  levelId: string;
  levelName: string;
  growthValue: number;
  totalPoints: number;
  availablePoints: number;
  inviteCode: string;
  invitedBy?: string;
  registerSource: string;
  status: number; // 0禁用 1正常
  lastLoginAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// 用户仓库
class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super('users');
  }

  // 根据 openId 查询
  async findByOpenId(openId: string): Promise<IUser | null> {
    return this.findOne({ openId });
  }

  // 根据 userId 查询
  async findByUserId(userId: string): Promise<IUser | null> {
    return this.findOne({ userId });
  }

  // 根据手机号查询
  async findByPhone(phone: string): Promise<IUser | null> {
    return this.findOne({ phone });
  }

  // 根据邀请码查询
  async findByInviteCode(inviteCode: string): Promise<IUser | null> {
    return this.findOne({ inviteCode });
  }

  // 更新积分
  async updatePoints(userId: string, pointsDelta: number): Promise<boolean> {
    const result = await this.collection.where({ userId }).update({
      availablePoints: this.cmd.inc(pointsDelta),
      totalPoints: pointsDelta > 0 ? this.cmd.inc(pointsDelta) : this.cmd.inc(0),
      updatedAt: new Date(),
    });
    return (result.updated ?? 0) > 0;
  }

  // 更新成长值
  async updateGrowthValue(userId: string, growthDelta: number): Promise<boolean> {
    const result = await this.collection.where({ userId }).update({
      growthValue: this.cmd.inc(growthDelta),
      updatedAt: new Date(),
    });
    return (result.updated ?? 0) > 0;
  }

  // 更新等级
  async updateLevel(userId: string, levelId: string, levelName: string): Promise<boolean> {
    const user = await this.findByUserId(userId);
    if (!user) return false;
    return this.updateById(user._id!, { levelId, levelName } as Partial<IUser>);
  }

  // 更新最后登录时间
  async updateLastLogin(userId: string): Promise<boolean> {
    const user = await this.findByUserId(userId);
    if (!user) return false;
    return this.updateById(user._id!, { lastLoginAt: new Date() } as Partial<IUser>);
  }
}

// 导出单例
export const User = new UserRepository();
