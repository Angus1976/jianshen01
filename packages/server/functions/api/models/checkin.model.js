"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareRule = exports.CheckinRecord = exports.CheckinTheme = void 0;
const base_repository_1 = require("../utils/base-repository");
class CheckinThemeRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('checkin_themes');
    }
    async findByThemeId(themeId) {
        return this.findOne({ themeId });
    }
    async findActiveThemes() {
        const { data } = await this.collection
            .where({ status: 1 })
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
}
exports.CheckinTheme = new CheckinThemeRepository();
class CheckinRecordRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('checkin_records');
    }
    async findByRecordId(recordId) {
        return this.findOne({ recordId });
    }
    async findByUserId(userId, limit = 20) {
        const { data } = await this.collection
            .where({ userId })
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        return data;
    }
    async findByThemeId(themeId, limit = 20) {
        const { data } = await this.collection
            .where({ themeId, reviewStatus: 1 })
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        return data;
    }
    // 获取用户今日打卡次数
    async getUserTodayCheckinCount(userId, themeId) {
        var _a;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const result = await this.collection
            .where({
            userId,
            themeId,
            createdAt: this.cmd.gte(today).and(this.cmd.lt(tomorrow)),
        })
            .count();
        return (_a = result.total) !== null && _a !== void 0 ? _a : 0;
    }
    // 标记为已分享
    async markAsShared(recordId) {
        const record = await this.findByRecordId(recordId);
        if (!record)
            return false;
        return this.updateById(record._id, {
            isShared: true,
            sharedAt: new Date(),
            shareCount: (record.shareCount || 0) + 1,
        });
    }
}
exports.CheckinRecord = new CheckinRecordRepository();
class ShareRuleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('share_rules');
    }
    async findActiveRule() {
        return this.findOne({ status: 1 });
    }
}
exports.ShareRule = new ShareRuleRepository();
