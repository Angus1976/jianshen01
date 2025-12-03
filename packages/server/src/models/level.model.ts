import { BaseRepository } from '../utils/base-repository';

// 等级规则
export interface ILevelRule {
  _id?: string;
  levelId: string;
  name: string;
  code: string;
  minGrowth: number;
  maxGrowth: number;
  icon: string;
  color: string;
  benefits: string[];
  sortOrder: number;
  status: number; // 0禁用 1启用
  createdAt?: Date;
  updatedAt?: Date;
}

class LevelRuleRepository extends BaseRepository<ILevelRule> {
  constructor() {
    super('level_rules');
  }

  async findByLevelId(levelId: string): Promise<ILevelRule | null> {
    return this.findOne({ levelId });
  }

  async findByCode(code: string): Promise<ILevelRule | null> {
    return this.findOne({ code });
  }

  async findActiveRules(): Promise<ILevelRule[]> {
    const { data } = await this.collection
      .where({ status: 1 })
      .orderBy('sortOrder', 'asc')
      .get();
    return data as ILevelRule[];
  }

  // 根据成长值查找对应等级
  async findByGrowthValue(growthValue: number): Promise<ILevelRule | null> {
    const { data } = await this.collection
      .where({
        status: 1,
        minGrowth: this.cmd.lte(growthValue),
        maxGrowth: this.cmd.gte(growthValue),
      })
      .limit(1)
      .get();
    return (data[0] as ILevelRule) || null;
  }
}

export const LevelRule = new LevelRuleRepository();

// 等级变动记录
export interface ILevelChangeLog {
  _id?: string;
  logId: string;
  userId: string;
  beforeLevelId: string;
  beforeLevelName: string;
  afterLevelId: string;
  afterLevelName: string;
  changeType: string; // upgrade/downgrade/manual
  reason: string;
  operatorId?: string;
  operatorName?: string;
  createdAt?: Date;
}

class LevelChangeLogRepository extends BaseRepository<ILevelChangeLog> {
  constructor() {
    super('level_change_logs');
  }

  async findByUserId(userId: string): Promise<ILevelChangeLog[]> {
    const { data } = await this.collection
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .get();
    return data as ILevelChangeLog[];
  }
}

export const LevelChangeLog = new LevelChangeLogRepository();
