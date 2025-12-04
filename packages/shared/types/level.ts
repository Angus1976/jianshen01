/**
 * 会员等级相关类型定义
 */

export interface Level {
  levelId: string;
  level: number;
  name: string;
  icon: string;
  minPoints: number;
  description: string;
  benefits: LevelBenefit[];
  color: string;
  sortOrder: number;
  status: LevelStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface LevelBenefit {
  benefitId: string;
  name: string;
  description: string;
  type: BenefitType;
  value: number | string;
  icon: string;
}

export enum BenefitType {
  Discount = 'discount',
  Gift = 'gift',
  Service = 'service',
  Priority = 'priority',
}

export enum LevelStatus {
  Disabled = 0,
  Active = 1,
}

export interface MyLevelInfo {
  levelId: string;
  levelName: string;
  levelCode: string;
  icon: string;
  color: string;
  benefits: string[];
  growthValue: number;
  minGrowth: number;
  maxGrowth: number;
  nextLevel: {
    levelId: string;
    levelName: string;
    minGrowth: number;
    needGrowth: number;
  } | null;
}
