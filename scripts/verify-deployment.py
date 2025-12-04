#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
RocketBird 部署验证脚本
配置 HTTP 触发器后运行此脚本验证部署
"""

import subprocess
import json
import time
import sys
import urllib.request
import urllib.error

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
H5_URL = "https://cloud1-4g2aaqb40446a63b-1390089965.tcloudbaseapp.com"
TEST_PHONE = "13800000001"
TEST_PASSWORD = "123456"

def print_header(text):
    """打印标题"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.ENDC}\n")

def print_step(step_num, text):
    """打印步骤"""
    print(f"{Colors.YELLOW}[步骤 {step_num}] {text}{Colors.ENDC}")

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
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "命令执行超时"
    except Exception as e:
        return False, "", str(e)

def test_http_request(method, path, data=None, headers=None):
    """测试 HTTP 请求"""
    url = f"{API_BASE_URL}{path}"
    
    if headers is None:
        headers = {}
    
    headers['Content-Type'] = 'application/json'
    
    try:
        if method == 'GET':
            req = urllib.request.Request(url, headers=headers, method='GET')
        elif method == 'POST':
            if data is None:
                data = {}
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode('utf-8'),
                headers=headers,
                method='POST'
            )
        else:
            return False, None, f"不支持的方法: {method}"
        
        with urllib.request.urlopen(req, timeout=5) as response:
            response_data = json.loads(response.read().decode('utf-8'))
            return True, response_data, None
    except urllib.error.HTTPError as e:
        try:
            error_data = json.loads(e.read().decode('utf-8'))
            return False, error_data, f"HTTP {e.code}: {e.reason}"
        except:
            return False, None, f"HTTP {e.code}: {e.reason}"
    except Exception as e:
        return False, None, str(e)

def verify_environment():
    """验证环境"""
    print_step(1, "验证 TCB 环境")
    
    cmd = f"tcb env list"
    success, stdout, stderr = run_command(cmd)
    
    if not success:
        print_error("无法获取环境列表")
        return False
    
    if ENV_ID in stdout:
        print_success(f"环境存在: {ENV_ID}")
        return True
    else:
        print_error(f"环境不存在: {ENV_ID}")
        return False

def verify_function():
    """验证云函数"""
    print_step(2, "验证云函数部署")
    
    cmd = f"tcb fn list --envId {ENV_ID}"
    success, stdout, stderr = run_command(cmd)
    
    if not success:
        print_error("无法获取云函数列表")
        return False
    
    if FUNCTION_NAME in stdout:
        print_success(f"云函数存在: {FUNCTION_NAME}")
        
        # 检查是否包含 "Deployment completed"
        if "Deployment completed" in stdout:
            print_success("云函数状态: 部署完成")
            return True
        else:
            print_error("云函数状态: 未完全部署")
            return False
    else:
        print_error(f"云函数不存在: {FUNCTION_NAME}")
        return False

def test_health_check():
    """测试健康检查"""
    print_step(3, "测试 API 健康检查")
    
    success, data, error = test_http_request('GET', '/api/health')
    
    if success:
        print_success("API 可访问")
        print_info(f"响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
        return True
    else:
        print_error(f"API 不可访问: {error}")
        
        if "404" in str(error):
            print_info("💡 提示: 触发器可能未配置")
        elif "Connection" in str(error):
            print_info("💡 提示: 网络连接问题")
        
        return False

def test_login():
    """测试登录"""
    print_step(4, "测试用户登录")
    
    login_data = {
        "phone": TEST_PHONE,
        "password": TEST_PASSWORD
    }
    
    success, data, error = test_http_request('POST', '/api/auth/password-login', login_data)
    
    if success:
        print_success("登录成功")
        
        # 提取 token
        if isinstance(data, dict) and 'data' in data:
            token = data['data'].get('token')
            if token:
                print_success(f"获取 Token: {token[:20]}...")
                return True, token
        
        print_info(f"响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
        return True, None
    else:
        print_error(f"登录失败: {error}")
        print_info(f"使用账户: {TEST_PHONE}")
        return False, None

def test_profile(token):
    """测试获取个人信息"""
    print_step(5, "测试获取个人信息")
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    success, data, error = test_http_request('GET', '/api/auth/profile', headers=headers)
    
    if success:
        print_success("获取个人信息成功")
        print_info(f"响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
        return True
    else:
        print_error(f"获取个人信息失败: {error}")
        return False

def show_summary(results):
    """显示总结"""
    print_header("✅ 验证总结")
    
    checks = [
        ("TCB 环境", results.get('environment', False)),
        ("云函数部署", results.get('function', False)),
        ("API 可访问", results.get('health_check', False)),
        ("用户登录", results.get('login', False)),
        ("获取个人信息", results.get('profile', False)),
    ]
    
    passed = sum(1 for _, result in checks if result)
    total = len(checks)
    
    for check_name, result in checks:
        status = f"{Colors.GREEN}✓{Colors.ENDC}" if result else f"{Colors.RED}✗{Colors.ENDC}"
        print(f"  {status} {check_name}")
    
    print()
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 所有检查通过！部署完成！{Colors.ENDC}")
        print(f"\n应用地址: {Colors.BLUE}{H5_URL}{Colors.ENDC}")
        print(f"登录账户: {TEST_PHONE} / {TEST_PASSWORD}")
        return True
    else:
        print(f"{Colors.YELLOW}⚠️  通过 {passed}/{total} 项检查{Colors.ENDC}")
        
        if not results.get('health_check'):
            print(f"\n{Colors.RED}关键问题: API 不可访问{Colors.ENDC}")
            print("可能原因:")
            print("  1. HTTP 触发器未配置")
            print("  2. 触发器配置生效需要 2-3 分钟")
            print("  3. 网络连接问题")
            print("\n解决方案:")
            print("  1. 再次运行 python3 scripts/setup-trigger.py")
            print("  2. 确认在 TCB 控制台配置了 HTTP 触发器")
            print("  3. 等待 2-3 分钟后重试")
        
        return False

def main():
    """主函数"""
    print_header("🚀 RocketBird 部署验证")
    
    print(f"{Colors.BOLD}配置信息:{Colors.ENDC}")
    print(f"  环境 ID: {Colors.BLUE}{ENV_ID}{Colors.ENDC}")
    print(f"  函数名: {Colors.BLUE}{FUNCTION_NAME}{Colors.ENDC}")
    print(f"  API 地址: {Colors.BLUE}{API_BASE_URL}{Colors.ENDC}")
    print()
    
    results = {}
    
    # 1. 验证环境
    results['environment'] = verify_environment()
    print()
    
    if not results['environment']:
        print_error("环境验证失败，停止后续检查")
        show_summary(results)
        return False
    
    # 2. 验证云函数
    results['function'] = verify_function()
    print()
    
    if not results['function']:
        print_error("云函数验证失败，停止后续检查")
        show_summary(results)
        return False
    
    # 3. 测试健康检查
    print_info("连接到 API 服务...")
    results['health_check'] = test_health_check()
    print()
    
    if not results['health_check']:
        print_error("API 不可访问，停止后续检查")
        show_summary(results)
        return False
    
    # 4. 测试登录
    login_success, token = test_login()
    results['login'] = login_success
    print()
    
    # 5. 测试获取个人信息（仅在登录成功时）
    results['profile'] = False
    if login_success and token:
        results['profile'] = test_profile(token)
    elif login_success:
        print_info("登录成功但未获取到 Token，跳过个人信息测试")
    
    print()
    
    # 显示总结
    show_summary(results)
    
    # 返回成功状态
    return all(results.values())

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}验证已取消{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}发生错误: {str(e)}{Colors.ENDC}")
        sys.exit(1)
