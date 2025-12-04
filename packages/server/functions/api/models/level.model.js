"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelChangeLog = exports.LevelRule = void 0;
const base_repository_1 = require("../utils/base-repository");
class LevelRuleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('level_rules');
    }
    async findByLevelId(levelId) {
        return this.findOne({ levelId });
    }
    async findByCode(code) {
        return this.findOne({ code });
    }
    async findActiveRules() {
        const { data } = await this.collection
            .where({ status: 1 })
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
    // 根据成长值查找对应等级
    async findByGrowthValue(growthValue) {
        const { data } = await this.collection
            .where({
            status: 1,
            minGrowth: this.cmd.lte(growthValue),
            maxGrowth: this.cmd.gte(growthValue),
        })
            .limit(1)
            .get();
        return data[0] || null;
    }
}
exports.LevelRule = new LevelRuleRepository();
class LevelChangeLogRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('level_change_logs');
    }
    async findByUserId(userId) {
        const { data } = await this.collection
            .where({ userId })
            .orderBy('createdAt', 'desc')
            .get();
        return data;
    }
}
exports.LevelChangeLog = new LevelChangeLogRepository();
