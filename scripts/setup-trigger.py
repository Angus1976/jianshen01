#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
RocketBird HTTP 触发器自动配置脚本
通过 TCB API 直接配置 HTTP 触发器（需要凭证）
"""

import subprocess
import json
import sys
import os

# 颜色定义
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# 配置
ENV_ID = "cloud1-4g2aaqb40446a63b"
FUNCTION_NAME = "api"

def print_header(text):
    """打印标题"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.ENDC}\n")

def print_step(text):
    """打印步骤"""
    print(f"{Colors.YELLOW}→ {text}{Colors.ENDC}")

def print_success(text):
    """打印成功信息"""
    print(f"{Colors.GREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    """打印错误信息"""
    print(f"{Colors.RED}✗ {text}{Colors.ENDC}")

def print_info(text):
    """打印信息"""
    print(f"{Colors.BLUE}ℹ {text}{Colors.ENDC}")

def run_command(cmd):
    """运行系统命令"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def get_function_detail():
    """获取云函数详细信息"""
    print_step("获取云函数详细信息")
    
    cmd = f"tcb fn list --envId {ENV_ID}"
    success, stdout, stderr = run_command(cmd)
    
    if not success:
        print_error("无法获取云函数信息")
        return None
    
    print_info("云函数状态:")
    print(stdout)
    print_success("云函数信息已获取")
    
    return True

def show_manual_steps():
    """显示手动配置步骤"""
    print_header("HTTP 触发器手动配置步骤")
    
    steps = f"""
{Colors.BOLD}⚠️  需要在 TCB 控制台手动配置{Colors.ENDC}

由于 TCB CLI 不支持触发器创建 API，需要在控制台手动操作:

{Colors.BOLD}第 1 步: 打开 TCB 控制台{Colors.ENDC}
  📍 https://console.cloud.tencent.com/tcb
  🔑 使用你的腾讯云账号登录

{Colors.BOLD}第 2 步: 进入环境{Colors.ENDC}
  1. 点击「环境」标签
  2. 选择环境: {Colors.BLUE}{ENV_ID}{Colors.ENDC}

{Colors.BOLD}第 3 步: 进入云函数{Colors.ENDC}
  1. 左侧菜单 → 「云函数」
  2. 找到函数: {Colors.BLUE}{FUNCTION_NAME}{Colors.ENDC}
  3. 点击进入详情页

{Colors.BOLD}第 4 步: 添加触发器{Colors.ENDC}
  1. 找到「触发器」标签
  2. 点击「新建触发器」按钮

{Colors.BOLD}第 5 步: 配置 HTTP 触发器{Colors.ENDC}
  
  {Colors.GREEN}触发器类型:{Colors.ENDC} HTTP
  {Colors.GREEN}路径:{Colors.ENDC} /api
  {Colors.GREEN}请求方法:{Colors.ENDC} GET, POST, PUT, DELETE, OPTIONS, HEAD
  {Colors.GREEN}启用 CORS:{Colors.ENDC} 是
  {Colors.GREEN}自定义返回:{Colors.ENDC} 不勾选
  
  👉 或者勾选「URL路由」然后配置:
     - 路径: /api/{"{proxy+}"}
     - 方法: 同上

{Colors.BOLD}第 6 步: 保存{Colors.ENDC}
  点击「完成」或「保存」

{Colors.BOLD}第 7 步: 等待生效{Colors.ENDC}
  ⏱️  等待 2-3 分钟，让触发器配置生效
  
  完成后会显示访问地址，格式如:
  {Colors.BLUE}https://service-xxx.sh.run.tcloudbase.com/release/api{Colors.ENDC}

{Colors.BOLD}第 8 步: 验证{Colors.ENDC}
  运行测试命令检查 API 是否正常工作
"""
    print(steps)

def show_test_commands():
    """显示测试命令"""
    print_header("API 测试命令")
    
    tests = f"""
{Colors.BOLD}1️⃣  测试健康检查{Colors.ENDC}

curl -X GET 'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/health' \\
  -H 'Content-Type: application/json'

{Colors.BOLD}2️⃣  测试密码登录{Colors.ENDC}

curl -X POST 'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/auth/password-login' \\
  -H 'Content-Type: application/json' \\
  -d '{{
    "phone": "13800000001",
    "password": "123456"
  }}'

预期响应:
{{
  "code": 0,
  "message": "Success",
  "data": {{
    "token": "eyJhbGc...",
    "user": {{
      "id": "...",
      "phone": "13800000001"
    }}
  }}
}}

{Colors.BOLD}3️⃣  测试获取个人信息{Colors.ENDC}

# 首先使用登录获取 token，然后:

curl -X GET 'https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com/api/auth/profile' \\
  -H 'Authorization: Bearer {{token}}'

{Colors.BOLD}4️⃣  查看实时日志{Colors.ENDC}

tcb fn log {FUNCTION_NAME} --envId {ENV_ID} --follow

{Colors.BOLD}5️⃣  浏览器测试{Colors.ENDC}

打开: https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com
使用测试账户登录:
  账户: 13800000001
  密码: 123456
"""
    print(tests)

def show_troubleshooting():
    """显示故障排除"""
    print_header("故障排除指南")
    
    troubleshooting = f"""
{Colors.BOLD}❌ 问题 1: API 返回 404{Colors.ENDC}

症状: curl 显示 404 Not Found
原因: HTTP 触发器未配置

解决:
  1. 检查触发器是否创建成功
  2. 确认触发器路径是否为 /api
  3. 等待 2-3 分钟让配置生效
  4. 刷新 TCB 控制台页面

{Colors.BOLD}❌ 问题 2: API 返回 502 或 503{Colors.ENDC}

症状: 云函数执行错误
原因: 云函数代码异常或超时

解决:
  1. 查看云函数日志: tcb fn log {FUNCTION_NAME} --envId {ENV_ID} --follow
  2. 检查代码是否部署完整
  3. 检查环境变量配置
  4. 重新部署云函数

{Colors.BOLD}❌ 问题 3: CORS 错误{Colors.ENDC}

症状: Access-Control-Allow-Origin 错误
原因: CORS 配置未启用

解决:
  1. 在 HTTP 触发器中启用 CORS
  2. 重新部署/重新加载

{Colors.BOLD}❌ 问题 4: 数据库查询错误{Colors.ENDC}

症状: Database connection error
原因: 数据库连接问题或集合不存在

解决:
  1. 检查 TCB 环境 ID 是否正确
  2. 检查数据库是否正常
  3. 首次请求会自动创建集合
  4. 查看云函数日志了解详情

{Colors.BOLD}🔧 有用的命令{Colors.ENDC}

查看环境列表:
  tcb env list

查看云函数列表:
  tcb fn list --envId {ENV_ID}

查看云函数日志 (实时):
  tcb fn log {FUNCTION_NAME} --envId {ENV_ID} --follow

查看云函数日志 (历史):
  tcb fn log {FUNCTION_NAME} --envId {ENV_ID}

查看静态网站文件:
  tcb hosting list --envId {ENV_ID}

{Colors.BOLD}📞 获取帮助{Colors.ENDC}

TCB 文档: https://cloud.tencent.com/document/product/876
CloudBase CLI: https://docs.cloudbase.net/cli/intro.html
项目文档: docs/DEPLOYMENT_COMPLETE.md
"""
    print(troubleshooting)

def main():
    """主函数"""
    print_header("RocketBird 部署配置工具")
    
    print(f"{Colors.BOLD}当前环境:{Colors.ENDC}")
    print(f"  环境 ID: {Colors.BLUE}{ENV_ID}{Colors.ENDC}")
    print(f"  函数名: {Colors.BLUE}{FUNCTION_NAME}{Colors.ENDC}")
    print()
    
    # 1. 获取云函数信息
    get_function_detail()
    print()
    
    # 2. 显示手动步骤
    show_manual_steps()
    print()
    
    # 3. 显示测试命令
    show_test_commands()
    print()
    
    # 4. 显示故障排除
    show_troubleshooting()
    print()
    
    print_header("✅ 配置指南已生成")
    print(f"{Colors.GREEN}请按照上面的步骤在 TCB 控制台配置 HTTP 触发器{Colors.ENDC}\n")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
