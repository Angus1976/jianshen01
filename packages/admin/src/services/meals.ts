import { get, post, put, del } from '@/utils/request';

export interface MealCategory {
  _id?: string;
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FitnessMeal {
  _id?: string;
  mealId: string;
  name: string;
  description?: string;
  coverImage?: string;
  images?: string[];
  categoryId: string;
  categoryName?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  ingredients?: string[];
  recipe?: string;
  preparationTime?: number;
  difficulty?: string;
  tags?: string[];
  sortOrder: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 分类相关
export const getMealCategories = (params?: { page?: number; pageSize?: number; status?: number | string }) => {
  return get<PaginatedResult<MealCategory>>('/meals/categories', params);
};

export const createMealCategory = (data: Partial<MealCategory>) => {
  return post<MealCategory>('/meals/categories', data);
};

export const updateMealCategory = (categoryId: string, data: Partial<MealCategory>) => {
  return put<{ message: string }>(`/meals/categories/${categoryId}`, data);
};

export const deleteMealCategory = (categoryId: string) => {
  return del<{ message: string }>(`/meals/categories/${categoryId}`);
};

// 餐品相关
export interface MealListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  status?: number | string;
}

export const getMealList = (params: MealListParams) => {
  return get<PaginatedResult<FitnessMeal>>('/meals', params);
};

export const getMealDetail = (mealId: string) => {
  return get<FitnessMeal>(`/meals/${mealId}`);
};

export const createMeal = (data: Partial<FitnessMeal>) => {
  return post<FitnessMeal>('/meals', data);
};

export const updateMeal = (mealId: string, data: Partial<FitnessMeal>) => {
  return put<{ message: string }>(`/meals/${mealId}`, data);
};

export const deleteMeal = (mealId: string) => {
  return del<{ message: string }>(`/meals/${mealId}`);
};
