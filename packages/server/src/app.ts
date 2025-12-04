import dotenv from 'dotenv';
import path from 'path';

// 根据环境加载对应的配置文件
const __dirname = path.dirname(__filename);
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });

import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
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

// 云函数入口
export const main = app;

export default app;
