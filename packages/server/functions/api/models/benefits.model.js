"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenefitRecord = exports.BenefitRule = void 0;
const base_repository_1 = require("../utils/base-repository");
class BenefitRuleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('benefit_rules');
    }
    async findByRuleId(ruleId) {
        return this.findOne({ ruleId });
    }
    async findActiveRules() {
        const { data } = await this.collection
            .where({ status: 1 })
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
    async findByType(type) {
        const { data } = await this.collection
            .where({ type, status: 1 })
            .get();
        return data;
    }
}
exports.BenefitRule = new BenefitRuleRepository();
class BenefitRecordRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('benefit_records');
    }
    async findByRecordId(recordId) {
        return this.findOne({ recordId });
    }
    async findByUserId(userId) {
        const { data } = await this.collection
            .where({ userId })
            .orderBy('createdAt', 'desc')
            .get();
        return data;
    }
    async findPendingByUserId(userId) {
        const { data } = await this.collection
            .where({ userId, status: 0 })
            .orderBy('expireAt', 'asc')
            .get();
        return data;
    }
}
exports.BenefitRecord = new BenefitRecordRepository();
