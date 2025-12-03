import { BaseRepository } from '../utils/base-repository';

// 健身餐分类
export interface IMealCategory {
  _id?: string;
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class MealCategoryRepository extends BaseRepository<IMealCategory> {
  constructor() {
    super('meal_categories');
  }

  async findByCategoryId(categoryId: string): Promise<IMealCategory | null> {
    return this.findOne({ categoryId });
  }

  async findActiveCategories(): Promise<IMealCategory[]> {
    const { data } = await this.collection
      .where({ status: 1 })
      .orderBy('sortOrder', 'asc')
      .get();
    return data as IMealCategory[];
  }
}

export const MealCategory = new MealCategoryRepository();

// 健身餐
export interface IFitnessMeal {
  _id?: string;
  mealId: string;
  name: string;
  description: string;
  coverImage: string;
  images: string[];
  categoryId: string;
  categoryName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Array<{
    name: string;
    amount: string;
  }>;
  steps: Array<{
    stepNo: number;
    content: string;
    image?: string;
  }>;
  cookingTime: number; // 分钟
  difficulty: number; // 1简单 2中等 3困难
  tags: string[];
  viewCount: number;
  favoriteCount: number;
  isRecommended: boolean;
  sortOrder: number;
  status: number; // 0下架 1上架
  createdAt?: Date;
  updatedAt?: Date;
}

class FitnessMealRepository extends BaseRepository<IFitnessMeal> {
  constructor() {
    super('fitness_meals');
  }

  async findByMealId(mealId: string): Promise<IFitnessMeal | null> {
    return this.findOne({ mealId });
  }

  async findByCategory(categoryId: string): Promise<IFitnessMeal[]> {
    const { data } = await this.collection
      .where({ categoryId, status: 1 })
      .orderBy('sortOrder', 'asc')
      .get();
    return data as IFitnessMeal[];
  }

  async findRecommended(): Promise<IFitnessMeal[]> {
    const { data } = await this.collection
      .where({ isRecommended: true, status: 1 })
      .orderBy('sortOrder', 'asc')
      .get();
    return data as IFitnessMeal[];
  }

  async incrementViewCount(mealId: string): Promise<boolean> {
    const result = await this.collection.where({ mealId }).update({
      viewCount: this.cmd.inc(1),
    });
    return (result.updated ?? 0) > 0;
  }

  async updateFavoriteCount(mealId: string, delta: number): Promise<boolean> {
    const result = await this.collection.where({ mealId }).update({
      favoriteCount: this.cmd.inc(delta),
    });
    return (result.updated ?? 0) > 0;
  }
}

export const FitnessMeal = new FitnessMealRepository();

// 用户收藏
export interface IMealFavorite {
  _id?: string;
  favoriteId: string;
  userId: string;
  mealId: string;
  createdAt?: Date;
}

class MealFavoriteRepository extends BaseRepository<IMealFavorite> {
  constructor() {
    super('meal_favorites');
  }

  async findByUserAndMeal(userId: string, mealId: string): Promise<IMealFavorite | null> {
    return this.findOne({ userId, mealId });
  }

  async findByUserId(userId: string): Promise<IMealFavorite[]> {
    const { data } = await this.collection
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .get();
    return data as IMealFavorite[];
  }

  async removeByUserAndMeal(userId: string, mealId: string): Promise<boolean> {
    const result = await this.collection.where({ userId, mealId }).remove();
    const deleted = typeof result.deleted === 'number' ? result.deleted : 0;
    return deleted > 0;
  }
}

export const MealFavorite = new MealFavoriteRepository();
