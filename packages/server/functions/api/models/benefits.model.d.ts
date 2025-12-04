import { BaseRepository } from '../utils/base-repository';
export interface IBenefitRule {
    _id?: string;
    ruleId: string;
    name: string;
    type: string;
    description: string;
    rewardType: string;
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
declare class BenefitRuleRepository extends BaseRepository<IBenefitRule> {
    constructor();
    findByRuleId(ruleId: string): Promise<IBenefitRule | null>;
    findActiveRules(): Promise<IBenefitRule[]>;
    findByType(type: string): Promise<IBenefitRule[]>;
}
export declare const BenefitRule: BenefitRuleRepository;
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
    status: number;
    claimedAt?: Date;
    usedAt?: Date;
    expireAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class BenefitRecordRepository extends BaseRepository<IBenefitRecord> {
    constructor();
    findByRecordId(recordId: string): Promise<IBenefitRecord | null>;
    findByUserId(userId: string): Promise<IBenefitRecord[]>;
    findPendingByUserId(userId: string): Promise<IBenefitRecord[]>;
}
export declare const BenefitRecord: BenefitRecordRepository;
export {};
//# sourceMappingURL=benefits.model.d.ts.map