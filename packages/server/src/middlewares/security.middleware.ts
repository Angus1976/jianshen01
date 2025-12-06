import { Request, Response, NextFunction } from 'express';

// Content Security Policy for RocketBird deployment
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://www.gstatic.com",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:3000 https://*",
      "frame-src 'self'",
      "base-uri 'self'",
    ].join('; ')
  );
  next();
};