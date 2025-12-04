import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    code: number;
    message: string;
    statusCode: number;
    constructor(code: number, message: string, statusCode?: number);
}
export declare function errorMiddleware(err: Error | AppError, req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error.middleware.d.ts.map