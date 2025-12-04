import { BaseRepository } from '../utils/base-repository';
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
    status: number;
    rewardedAt?: Date;
    createdAt?: Date;
}
declare class InviteRecordRepository extends BaseRepository<IInviteRecord> {
    constructor();
    findByRecordId(recordId: string): Promise<IInviteRecord | null>;
    findByInviterId(inviterId: string): Promise<IInviteRecord[]>;
    findByInviteeId(inviteeId: string): Promise<IInviteRecord | null>;
    countByInviterId(inviterId: string): Promise<number>;
    countTodayByInviterId(inviterId: string): Promise<number>;
}
export declare const InviteRecord: InviteRecordRepository;
export interface IInviteRule {
    _id?: string;
    ruleId: string;
    name: string;
    description: string;
    inviterReward: number;
    inviteeReward: number;
    rewardCondition: string;
    maxInvitesPerDay: number;
    maxInvitesTotal: number;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class InviteRuleRepository extends BaseRepository<IInviteRule> {
    constructor();
    findActiveRule(): Promise<IInviteRule | null>;
}
export declare const InviteRule: InviteRuleRepository;
export {};
//# sourceMappingURL=referral.model.d.ts.map