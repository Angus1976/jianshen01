// 最小化测试 - 没有任何导入
const express = require('express');

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 导出处理器供 CloudBase 调用
exports.main = app;
