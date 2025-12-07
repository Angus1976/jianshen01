// 注意: 在 CloudBase Node.js 10.15 运行时中，避免任何可能导致 __dirname 重复声明的操作
// 包括不使用 path 模块

import dotenv from 'dotenv';

// 为了避免 path 模块的问题，直接使用环境变量配置
// 生产环境变量应该在云环境中设置
try {
  dotenv.config();
} catch (e) {
  // 忽略配置加载错误
}

import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { securityMiddleware } from './middlewares/security.middleware';
import routes from './routes';
import { connectDatabase } from './config/database';

const app = express();

// CORS 配置
const corsOptions = {
  origin: [
    'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com',
    'https://cloud1-4g2aaqb40446a63b-1305836789.tcloudbaseapp.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(securityMiddleware);

// 静态文件服务（容器部署时）
const publicDir = path.join(process.cwd(), 'public');
const h5Dir = path.join(publicDir, 'h5');
const adminDir = path.join(publicDir, 'admin');

const sendIndex = (filePath: string) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.sendFile(filePath, (err) => {
    if (err) {
      next(err);
    }
  });
};

app.use('/h5', express.static(h5Dir));
app.use('/admin', express.static(adminDir));
app.use('/user', express.static(h5Dir));
app.use('/assets', express.static(path.join(h5Dir, 'assets')));

app.get(['/admin', '/admin/*'], sendIndex(path.join(adminDir, 'index.html')));
app.get(['/user', '/user/*', '/h5', '/h5/*'], sendIndex(path.join(h5Dir, 'index.html')));

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>RocketBird 入口</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding-top: 140px; background: #0f172a; color: white; }
          .card { background: rgba(255,255,255,0.08); border-radius: 1rem; padding: 2rem; display: inline-block; min-width: 280px; }
          a { display: block; margin: 1rem 0; padding: 0.75rem 1.5rem; border-radius: 999px; text-decoration: none; color: #0f172a; font-weight: bold; }
          .user { background: #38bdf8; }
          .admin { background: #f97316; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>RocketBird 登录</h1>
          <p>请选择你要访问的注册 / 登录入口</p>
          <a class="user" href="/user/#/pages/login/index">会员端登录</a>
          <a class="admin" href="/admin/login">管理后台登录</a>
        </div>
      </body>
    </html>
  `);
});

app.use('/api', routes);

app.use('/', express.static(h5Dir));

// 错误处理
app.use(errorMiddleware);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// also expose api health endpoint to match Docker HEALTHCHECK and platform expectations
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectDatabase();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

import serverless from 'serverless-http';

// 云函数入口
export const main_handler = serverless(app);

export const main = app;

export default app;
