import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            admin?: {
                adminId: string;
                username: string;
                roleId: string;
                permissions: string[];
            };
        }
    }
}
/**
 * 管理员认证中间件
 */
export declare const adminAuthMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * 权限检查中间件
 */
export declare const permissionMiddleware: (requiredPermission: string) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=admin-auth.middleware.d.ts.map