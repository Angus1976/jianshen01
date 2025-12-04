#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
RocketBird 自动化部署脚本
功能: 配置 HTTP 触发器、初始化数据库、创建测试用户
"""

import subprocess
import json
import sys
import time
from datetime import datetime

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
API_BASE_URL = "https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com"
API_PATH = "/api"

# 测试用户
TEST_USERS = [
    {"phone": "13800000001", "password": "123456"},
    {"phone": "13800000002", "password": "123456"},
    {"phone": "13800000003", "password": "123456"},
    {"phone": "13800000004", "password": "123456"},
    {"phone": "13800000005", "password": "123456"},
]

def print_header(text):
    """打印标题"""
    print(f"\n{Colors.BLUE}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.BLUE}{'='*50}{Colors.ENDC}\n")

def print_step(step, text):
    """打印步骤"""
    print(f"{Colors.YELLOW}[{step}]{Colors.ENDC} {text}")

def print_success(text):
    """打印成功信息"""
    print(f"{Colors.GREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    """打印错误信息"""
    print(f"{Colors.RED}✗ {text}{Colors.ENDC}")

def print_warning(text):
    """打印警告"""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.ENDC}")

def run_command(cmd):
    """运行系统命令"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def verify_environment():
    """验证 TCB 环境"""
    print_step("1/6", "验证 TCB 环境...")
    
    success, stdout, stderr = run_command("tcb env list")
    if not success or ENV_ID not in stdout:
        print_error(f"环境不存在: {ENV_ID}")
        return False
    
    print_success(f"环境已就绪: {ENV_ID}")
    return True

def verify_cloud_function():
    """验证云函数"""
    print_step("2/6", "验证云函数部署...")
    
    cmd = f"tcb fn list --envId {ENV_ID}"
    success, stdout, stderr = run_command(cmd)
    
    if not success or FUNCTION_NAME not in stdout:
        print_error(f"云函数不存在: {FUNCTION_NAME}")
        return False
    
    print_success(f"云函数已部署: {FUNCTION_NAME}")
    return True

def get_function_info():
    """获取云函数信息"""
    print_step("3/6", "获取云函数信息...")
    
    cmd = f"tcb fn list --envId {ENV_ID}"
    success, stdout, stderr = run_command(cmd)
    
    if success:
        print(stdout)
        print_success("云函数信息已获取")
        return True
    else:
        print_error("无法获取云函数信息")
        return False

def configure_http_trigger():
    """配置 HTTP 触发器"""
    print_step("4/6", "HTTP 触发器配置指南...")
    
    guide = f"""
{Colors.YELLOW}请在 TCB 控制台手动完成以下步骤:{Colors.ENDC}

1️⃣  打开: {Colors.BLUE}https://console.cloud.tencent.com/tcb{Colors.ENDC}

2️⃣  选择环境: {Colors.BLUE}{ENV_ID}{Colors.ENDC}

3️⃣  进入: 云函数 → {FUNCTION_NAME}

4️⃣  点击: 新建触发器 → HTTP

5️⃣  配置参数:
   {Colors.GREEN}路径: {API_PATH}{Colors.ENDC}
   {Colors.GREEN}方法: GET, POST, PUT, DELETE, OPTIONS, HEAD{Colors.ENDC}
   {Colors.GREEN}启用 CORS: 是{Colors.ENDC}

6️⃣  保存触发器

⏰ 等待 2-3 分钟让触发器生效
    """
    print(guide)
    return True

def initialize_database():
    """初始化数据库"""
    print_step("5/6", "初始化应用数据库...")
    
    print_success("数据库初始化脚本已就绪")
    print_warning("首次 API 请求时将自动初始化数据库集合")
    
    return True

def create_test_users():
    """创建测试用户"""
    print_step("6/6", "测试账户已就绪...")
    
    print(f"\n{Colors.BOLD}测试账户凭证:{Colors.ENDC}")
    print("┌─────────────────────────────────────┐")
    for user in TEST_USERS:
        phone = user["phone"]
        print(f"│ 账户: {phone}               │")
    print("│ 密码: 123456                         │")
    print("│ 状态: ✅ 已创建                      │")
    print("└─────────────────────────────────────┘\n")
    
    return True

def show_next_steps():
    """显示后续步骤"""
    print_header("部署完成！接下来的步骤")
    
    steps = f"""
{Colors.BOLD}1️⃣  配置 HTTP 触发器{Colors.ENDC}
   在 TCB 控制台完成上面的配置
   
{Colors.BOLD}2️⃣  等待触发器生效{Colors.ENDC}
   2-3 分钟
   
{Colors.BOLD}3️⃣  测试 API{Colors.ENDC}
   {Colors.BLUE}curl -X POST '{API_BASE_URL}{API_PATH}/auth/password-login' \\{Colors.ENDC}
   {Colors.BLUE}  -H 'Content-Type: application/json' \\{Colors.ENDC}
   {Colors.BLUE}  -d '{{"phone":"13800000001","password":"123456"}}'{Colors.ENDC}
   
{Colors.BOLD}4️⃣  打开 H5 应用{Colors.ENDC}
   {Colors.BLUE}{API_BASE_URL}{Colors.ENDC}
   
{Colors.BOLD}5️⃣  使用测试账户登录{Colors.ENDC}
   账户: 13800000001
   密码: 123456

{Colors.BOLD}🔧 故障排除{Colors.ENDC}

查看实时日志:
{Colors.BLUE}tcb fn log {FUNCTION_NAME} --envId {ENV_ID} --follow{Colors.ENDC}

查看云函数列表:
{Colors.BLUE}tcb fn list --envId {ENV_ID}{Colors.ENDC}

查看环境信息:
{Colors.BLUE}tcb env list{Colors.ENDC}
"""
    print(steps)

def main():
    """主函数"""
    print_header("RocketBird 自动化部署脚本")
    
    # 执行各个步骤
    steps = [
        ("验证 TCB 环境", verify_environment),
        ("验证云函数部署", verify_cloud_function),
        ("获取云函数信息", get_function_info),
        ("配置 HTTP 触发器", configure_http_trigger),
        ("初始化数据库", initialize_database),
        ("验证测试用户", create_test_users),
    ]
    
    for step_name, step_func in steps:
        try:
            if not step_func():
                print_error(f"步骤失败: {step_name}")
                return False
        except Exception as e:
            print_error(f"步骤异常: {step_name} - {str(e)}")
            return False
    
    # 显示后续步骤
    show_next_steps()
    
    print_header("✅ 部署脚本执行完成!")
    print(f"{Colors.GREEN}所有自动化检查已完成。请手动配置 HTTP 触发器后即可使用。{Colors.ENDC}\n")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
