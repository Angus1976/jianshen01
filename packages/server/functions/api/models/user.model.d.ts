import { BaseRepository } from '../utils/base-repository';
export interface IUser {
    _id?: string;
    userId: string;
    openId: string;
    unionId?: string;
    phone?: string;
    password?: string;
    nickname: string;
    avatar: string;
    gender: number;
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
    status: number;
    lastLoginAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class UserRepository extends BaseRepository<IUser> {
    constructor();
    findByOpenId(openId: string): Promise<IUser | null>;
    findByUserId(userId: string): Promise<IUser | null>;
    findByPhone(phone: string): Promise<IUser | null>;
    findByInviteCode(inviteCode: string): Promise<IUser | null>;
    updatePoints(userId: string, pointsDelta: number): Promise<boolean>;
    updateGrowthValue(userId: string, growthDelta: number): Promise<boolean>;
    updateLevel(userId: string, levelId: string, levelName: string): Promise<boolean>;
    updateLastLogin(userId: string): Promise<boolean>;
}
export declare const User: UserRepository;
export {};
//# sourceMappingURL=user.model.d.ts.map