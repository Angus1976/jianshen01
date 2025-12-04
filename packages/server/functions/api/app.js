"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// 根据环境加载对应的配置文件
const __dirname = path_1.default.dirname(__filename);
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../', envFile) });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./config/database");
const app = (0, express_1.default)();
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_middleware_1.loggerMiddleware);
// 路由
app.use('/api', routes_1.default);
// 错误处理
app.use(error_middleware_1.errorMiddleware);
// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 启动服务
const PORT = process.env.PORT || 3000;
async function bootstrap() {
    try {
        // 连接数据库
        await (0, database_1.connectDatabase)();
        console.log('Database connected');
        // 启动服务器
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
exports.default = app;
