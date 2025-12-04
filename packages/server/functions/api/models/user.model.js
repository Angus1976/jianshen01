"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const base_repository_1 = require("../utils/base-repository");
// 用户仓库
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('users');
    }
    // 根据 openId 查询
    async findByOpenId(openId) {
        return this.findOne({ openId });
    }
    // 根据 userId 查询
    async findByUserId(userId) {
        return this.findOne({ userId });
    }
    // 根据手机号查询
    async findByPhone(phone) {
        return this.findOne({ phone });
    }
    // 根据邀请码查询
    async findByInviteCode(inviteCode) {
        return this.findOne({ inviteCode });
    }
    // 更新积分
    async updatePoints(userId, pointsDelta) {
        var _a;
        const result = await this.collection.where({ userId }).update({
            availablePoints: this.cmd.inc(pointsDelta),
            totalPoints: pointsDelta > 0 ? this.cmd.inc(pointsDelta) : this.cmd.inc(0),
            updatedAt: new Date(),
        });
        return ((_a = result.updated) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    // 更新成长值
    async updateGrowthValue(userId, growthDelta) {
        var _a;
        const result = await this.collection.where({ userId }).update({
            growthValue: this.cmd.inc(growthDelta),
            updatedAt: new Date(),
        });
        return ((_a = result.updated) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    // 更新等级
    async updateLevel(userId, levelId, levelName) {
        const user = await this.findByUserId(userId);
        if (!user)
            return false;
        return this.updateById(user._id, { levelId, levelName });
    }
    // 更新最后登录时间
    async updateLastLogin(userId) {
        const user = await this.findByUserId(userId);
        if (!user)
            return false;
        return this.updateById(user._id, { lastLoginAt: new Date() });
    }
}
// 导出单例
exports.User = new UserRepository();
