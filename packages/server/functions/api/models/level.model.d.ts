import { BaseRepository } from '../utils/base-repository';
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
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class LevelRuleRepository extends BaseRepository<ILevelRule> {
    constructor();
    findByLevelId(levelId: string): Promise<ILevelRule | null>;
    findByCode(code: string): Promise<ILevelRule | null>;
    findActiveRules(): Promise<ILevelRule[]>;
    findByGrowthValue(growthValue: number): Promise<ILevelRule | null>;
}
export declare const LevelRule: LevelRuleRepository;
export interface ILevelChangeLog {
    _id?: string;
    logId: string;
    userId: string;
    beforeLevelId: string;
    beforeLevelName: string;
    afterLevelId: string;
    afterLevelName: string;
    changeType: string;
    reason: string;
    operatorId?: string;
    operatorName?: string;
    createdAt?: Date;
}
declare class LevelChangeLogRepository extends BaseRepository<ILevelChangeLog> {
    constructor();
    findByUserId(userId: string): Promise<ILevelChangeLog[]>;
}
export declare const LevelChangeLog: LevelChangeLogRepository;
export {};
//# sourceMappingURL=level.model.d.ts.map