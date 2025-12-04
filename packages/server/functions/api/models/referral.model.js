"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteRule = exports.InviteRecord = void 0;
const base_repository_1 = require("../utils/base-repository");
class InviteRecordRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('invite_records');
    }
    async findByRecordId(recordId) {
        return this.findOne({ recordId });
    }
    async findByInviterId(inviterId) {
        const { data } = await this.collection
            .where({ inviterId })
            .orderBy('createdAt', 'desc')
            .get();
        return data;
    }
    async findByInviteeId(inviteeId) {
        return this.findOne({ inviteeId });
    }
    async countByInviterId(inviterId) {
        var _a;
        const result = await this.collection.where({ inviterId }).count();
        return (_a = result.total) !== null && _a !== void 0 ? _a : 0;
    }
    async countTodayByInviterId(inviterId) {
        var _a;
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
        return (_a = result.total) !== null && _a !== void 0 ? _a : 0;
    }
}
exports.InviteRecord = new InviteRecordRepository();
class InviteRuleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('invite_rules');
    }
    async findActiveRule() {
        return this.findOne({ status: 1 });
    }
}
exports.InviteRule = new InviteRuleRepository();
