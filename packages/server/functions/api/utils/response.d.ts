import { Response } from 'express';
/**
 * 成功响应
 */
export declare function success<T>(res: Response, data: T, message?: string): Response;
/**
 * 错误响应
 */
export declare function error(res: Response, code: number, message: string, statusCode?: number): Response;
/**
 * 分页响应
 */
export declare function paginated<T>(res: Response, list: T[], total: number, page: number, pageSize: number): Response;
//# sourceMappingURL=response.d.ts.map