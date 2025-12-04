# ⚡ 快速命令参考

> 复制粘贴即可运行的常用命令

---

## 🔧 配置相关

### 查看所有配置步骤

```bash
python3 scripts/setup-cloudbase.py --manual-steps
```

### 输出配置 JSON

```bash
python3 scripts/setup-cloudbase.py --config-json
```

### 查看脚本帮助

```bash
python3 scripts/setup-cloudbase.py --help
```

---

## 🧪 API 测试

### 获取 curl 测试命令

```bash
python3 scripts/setup-cloudbase.py --curl-examples
```

### 测试密码登录

```bash
curl -X POST 'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/auth/password-login' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"13800000001","password":"123456"}'
```

### 测试健康检查

```bash
curl https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/health
```

### 获取个人信息

```bash
curl -X GET 'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/auth/profile' \
  -H 'Authorization: Bearer {token}'
```

---

## 📊 日志相关

### 查看实时日志

```bash
tcb fn log api -e cloud1-4g2aaqb40446a63b --follow
```

### 查看最近日志 (100 行)

```bash
tcb fn log api -e cloud1-4g2aaqb40446a63b | tail -100
```

### 导出日志到文件

```bash
tcb fn log api -e cloud1-4g2aaqb40446a63b > logs.txt
```

### 搜索特定日志

```bash
tcb fn log api -e cloud1-4g2aaqb40446a63b | grep "error"
```

---

## 🚀 部署相关

### 部署所有模块

```bash
bash scripts/deploy-tcb.sh all
```

### 仅部署后端

```bash
bash scripts/deploy-tcb.sh server
```

### 仅部署管理后台

```bash
bash scripts/deploy-tcb.sh admin
```

### 仅部署 H5

```bash
bash scripts/deploy-tcb.sh h5
```

### 查看部署状态

```bash
bash scripts/deploy-tcb.sh status
```

---

## 💻 本地开发

### 安装依赖

```bash
npm install
```

### 运行 H5 开发服务

```bash
cd packages/member-h5
npm run dev
```

### 运行管理后台开发服务

```bash
cd packages/admin
npm run dev
```

### 运行后端开发服务

```bash
cd packages/server
npm run dev
```

### 全部构建

```bash
npm run build
```

### 清理构建

```bash
npm run clean
```

---

## 🔑 TCB 相关

### 查看环境信息

```bash
tcb env:list
```

### 列出所有云函数

```bash
tcb fn:list -e cloud1-4g2aaqb40446a63b
```

### 查看云函数详情

```bash
tcb fn:info api -e cloud1-4g2aaqb40446a63b
```

### 查看数据库集合

```bash
tcb db:collection:list -e cloud1-4g2aaqb40446a63b
```

---

## 🎯 组合命令

### 完整部署 + 测试

```bash
# 1. 部署
bash scripts/deploy-tcb.sh all

# 2. 查看日志
tcb fn log api -e cloud1-4g2aaqb40446a63b --follow

# 3. 测试
python3 scripts/setup-cloudbase.py --curl-examples
```

### 快速诊断

```bash
echo "=== 检查 API 状态 ==="
curl https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/health

echo ""
echo "=== 查看最新日志 ==="
tcb fn log api -e cloud1-4g2aaqb40446a63b | tail -20

echo ""
echo "=== 检查环境 ==="
tcb env:list
```

### 持续监控

```bash
# 创建监控脚本
watch -n 5 'tcb fn log api -e cloud1-4g2aaqb40446a63b | tail -30'
```

---

## 📝 环境变量

### 查看环境变量 (.env)

```bash
cat .env
```

### 更新环境变量

```bash
# 编辑 .env 文件
vi .env

# 重新部署
bash scripts/deploy-tcb.sh server
```

---

## 🔍 查找和替换

### 在所有文件中搜索

```bash
grep -r "search_term" packages/
```

### 替换所有匹配的文本

```bash
find packages -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/old/new/g'
```

---

## 🆘 故障排除命令

### 重启云函数

```bash
# 删除旧版本
tcb fn:delete api -e cloud1-4g2aaqb40446a63b

# 重新部署
bash scripts/deploy-tcb.sh server
```

### 清理临时文件

```bash
# 清理 node_modules
find packages -type d -name node_modules -exec rm -rf {} +

# 清理构建输出
find packages -type d -name dist -exec rm -rf {} +

# 重新安装
npm install
```

### 重置数据库连接

```bash
# 查看日志找到错误
tcb fn log api -e cloud1-4g2aaqb40446a63b

# 重启后端
bash scripts/deploy-tcb.sh server
```

---

## 📚 查看文档

### 打开项目总结

```bash
open FINAL_SUMMARY.md
# 或
cat FINAL_SUMMARY.md | less
```

### 打开快速开始

```bash
open QUICK_START.md
```

### 打开文档导航

```bash
open docs/README.md
```

---

## 🎓 学习命令

### 查看脚本帮助

```bash
python3 scripts/setup-cloudbase.py --help
bash scripts/setup-cloudbase.sh --help
bash scripts/deploy-tcb.sh --help
```

### 查看项目结构

```bash
# 显示目录树
tree -L 2 packages/

# 或使用 ls
find packages -maxdepth 2 -type d | sort
```

### 查看 git 历史

```bash
git log --oneline
git log --graph --oneline --all
```

---

## 🔐 安全相关

### 查看环境变量 (不显示值)

```bash
env | grep -E "CLOUDBASE|JWT|CORS"
```

### 查看已配置的 CORS

```bash
grep -r "CORS\|cors" packages/server/src
```

### 验证 JWT Token

```bash
# 获取 token（登录后）
TOKEN="your_token_here"

# 验证 token
curl -X GET 'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/auth/profile' \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💾 备份和恢复

### 导出数据库

```bash
# 导出 users 集合
tcb db:export users -e cloud1-4g2aaqb40446a63b > users_backup.json
```

### 导入数据

```bash
tcb db:import users -e cloud1-4g2aaqb40446a63b users_backup.json
```

---

## 🎯 常用命令速记

```bash
# 最常用的 5 个命令
1. python3 scripts/setup-cloudbase.py --manual-steps
2. tcb fn log api -e cloud1-4g2aaqb40446a63b --follow
3. bash scripts/deploy-tcb.sh all
4. python3 scripts/setup-cloudbase.py --curl-examples
5. npm run build
```

---

## 📋 命令分类

### 按频率分类

**每天**:
- `tcb fn log api -e cloud1-4g2aaqb40446a63b --follow` (查看日志)

**每周**:
- `bash scripts/deploy-tcb.sh all` (部署)
- `npm run build` (构建)

**每月**:
- `tcb db:export` (备份)
- `tcb env:list` (检查环境)

### 按场景分类

**部署**:
```bash
bash scripts/deploy-tcb.sh all
```

**测试**:
```bash
python3 scripts/setup-cloudbase.py --curl-examples
```

**调试**:
```bash
tcb fn log api -e cloud1-4g2aaqb40446a63b --follow
```

**开发**:
```bash
cd packages/member-h5 && npm run dev
```

---

## 🔗 命令链接

### 更多信息

- 完整文档: [`docs/SCRIPTS_GUIDE.md`](./docs/SCRIPTS_GUIDE.md)
- 项目总结: [`FINAL_SUMMARY.md`](./FINAL_SUMMARY.md)
- 快速开始: [`QUICK_START.md`](./QUICK_START.md)

---

**提示**: 复制这个文件到你的本地，方便快速查询 ⚡
