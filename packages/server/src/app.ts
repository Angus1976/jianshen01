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
app.use('/h5', express.static('public/h5'));
app.use('/admin', express.static('public/admin'));
app.use('/', express.static('public/h5')); // H5 作为默认首页

// 路由
app.use('/api', routes);

// 错误处理
app.use(errorMiddleware);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // 连接数据库
    await connectDatabase();
    console.log('Database connected');

    // 启动服务器
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
