import { BaseRepository } from '../utils/base-repository';
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
declare class MealCategoryRepository extends BaseRepository<IMealCategory> {
    constructor();
    findByCategoryId(categoryId: string): Promise<IMealCategory | null>;
    findActiveCategories(): Promise<IMealCategory[]>;
}
export declare const MealCategory: MealCategoryRepository;
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
    cookingTime: number;
    difficulty: number;
    tags: string[];
    viewCount: number;
    favoriteCount: number;
    isRecommended: boolean;
    sortOrder: number;
    status: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare class FitnessMealRepository extends BaseRepository<IFitnessMeal> {
    constructor();
    findByMealId(mealId: string): Promise<IFitnessMeal | null>;
    findByCategory(categoryId: string): Promise<IFitnessMeal[]>;
    findRecommended(): Promise<IFitnessMeal[]>;
    incrementViewCount(mealId: string): Promise<boolean>;
    updateFavoriteCount(mealId: string, delta: number): Promise<boolean>;
}
export declare const FitnessMeal: FitnessMealRepository;
export interface IMealFavorite {
    _id?: string;
    favoriteId: string;
    userId: string;
    mealId: string;
    createdAt?: Date;
}
declare class MealFavoriteRepository extends BaseRepository<IMealFavorite> {
    constructor();
    findByUserAndMeal(userId: string, mealId: string): Promise<IMealFavorite | null>;
    findByUserId(userId: string): Promise<IMealFavorite[]>;
    removeByUserAndMeal(userId: string, mealId: string): Promise<boolean>;
}
export declare const MealFavorite: MealFavoriteRepository;
export {};
//# sourceMappingURL=meals.model.d.ts.map