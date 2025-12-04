"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealFavorite = exports.FitnessMeal = exports.MealCategory = void 0;
const base_repository_1 = require("../utils/base-repository");
class MealCategoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('meal_categories');
    }
    async findByCategoryId(categoryId) {
        return this.findOne({ categoryId });
    }
    async findActiveCategories() {
        const { data } = await this.collection
            .where({ status: 1 })
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
}
exports.MealCategory = new MealCategoryRepository();
class FitnessMealRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('fitness_meals');
    }
    async findByMealId(mealId) {
        return this.findOne({ mealId });
    }
    async findByCategory(categoryId) {
        const { data } = await this.collection
            .where({ categoryId, status: 1 })
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
    async findRecommended() {
        const { data } = await this.collection
            .where({ isRecommended: true, status: 1 })
            .orderBy('sortOrder', 'asc')
            .get();
        return data;
    }
    async incrementViewCount(mealId) {
        var _a;
        const result = await this.collection.where({ mealId }).update({
            viewCount: this.cmd.inc(1),
        });
        return ((_a = result.updated) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    async updateFavoriteCount(mealId, delta) {
        var _a;
        const result = await this.collection.where({ mealId }).update({
            favoriteCount: this.cmd.inc(delta),
        });
        return ((_a = result.updated) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.FitnessMeal = new FitnessMealRepository();
class MealFavoriteRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('meal_favorites');
    }
    async findByUserAndMeal(userId, mealId) {
        return this.findOne({ userId, mealId });
    }
    async findByUserId(userId) {
        const { data } = await this.collection
            .where({ userId })
            .orderBy('createdAt', 'desc')
            .get();
        return data;
    }
    async removeByUserAndMeal(userId, mealId) {
        const result = await this.collection.where({ userId, mealId }).remove();
        const deleted = typeof result.deleted === 'number' ? result.deleted : 0;
        return deleted > 0;
    }
}
exports.MealFavorite = new MealFavoriteRepository();
