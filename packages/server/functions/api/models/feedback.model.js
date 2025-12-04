"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feedback = void 0;
const base_repository_1 = require("../utils/base-repository");
class FeedbackRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('feedbacks');
    }
    async findByFeedbackId(feedbackId) {
        return this.findOne({ feedbackId });
    }
    async findByUserId(userId) {
        const { data } = await this.collection
            .where({ userId })
            .orderBy('createdAt', 'desc')
            .get();
        return data;
    }
    async findByStatus(status) {
        const { data } = await this.collection
            .where({ status })
            .orderBy('createdAt', 'desc')
            .get();
        return data;
    }
}
exports.Feedback = new FeedbackRepository();
