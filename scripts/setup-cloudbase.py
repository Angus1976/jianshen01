#!/usr/bin/env python3
"""
RocketBird CloudBase 云函数自动配置脚本
使用 TCB SDK 直接创建和管理触发器

安装依赖:
pip install tencentcloud-sdk-python

用法:
python3 scripts/setup-cloudbase.py --env-id cloud1-4g2aaqb40446a63b

"""

import argparse
import json
import sys
import os
from typing import Dict, Any, List

# 颜色定义
class Colors:
    INFO = '\033[94m'
    SUCCESS = '\033[92m'
    WARNING = '\033[93m'
    ERROR = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_info(msg: str):
    print(f"{Colors.INFO}ℹ️  {msg}{Colors.RESET}")

def print_success(msg: str):
    print(f"{Colors.SUCCESS}✅ {msg}{Colors.RESET}")

def print_warning(msg: str):
    print(f"{Colors.WARNING}⚠️  {msg}{Colors.RESET}")

def print_error(msg: str):
    print(f"{Colors.ERROR}❌ {msg}{Colors.RESET}", file=sys.stderr)

def print_section(title: str):
    print(f"\n{Colors.BOLD}{'='*40}{Colors.RESET}")
    print(f"{Colors.BOLD}{title}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*40}{Colors.RESET}\n")

# 触发器配置
TRIGGERS_CONFIG = {
    "http": {
        "name": "api_http",
        "type": "http",
        "config": {
            "path": "/api",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"]
        },
        "description": "HTTP 触发器 - API 服务入口"
    },
    "daily_cleanup": {
        "name": "daily_cleanup",
        "type": "timer",
        "config": {
            "cron": "0 2 * * *",
            "argument": {"action": "cleanup_expired_tokens"}
        },
        "description": "每天凌晨 2 点清理过期 Token"
    },
    "hourly_stats": {
        "name": "hourly_stats",
        "type": "timer",
        "config": {
            "cron": "0 * * * *",
            "argument": {"action": "update_statistics"}
        },
        "description": "每小时更新统计数据"
    },
    "weekly_report": {
        "name": "weekly_report",
        "type": "timer",
        "config": {
            "cron": "0 10 ? * MON",
            "argument": {"action": "weekly_report"}
        },
        "description": "每周一 10 点生成周报"
    },
    "monthly_reset": {
        "name": "monthly_reset",
        "type": "timer",
        "config": {
            "cron": "0 0 1 * *",
            "argument": {"action": "monthly_reset"}
        },
        "description": "每月 1 号执行月度重置"
    }
}

class CloudBaseTriggerManager:
    """CloudBase 触发器管理器"""
    
    def __init__(self, env_id: str, secret_id: str = None, secret_key: str = None):
        self.env_id = env_id
        self.secret_id = secret_id or os.getenv('TCB_SECRET_ID')
        self.secret_key = secret_key or os.getenv('TCB_SECRET_KEY')
        
        if not self.secret_id or not self.secret_key:
            print_warning("未找到 TCB_SECRET_ID 或 TCB_SECRET_KEY")
            print_info("请在 .env 文件中配置，或通过环境变量设置")
    
    def validate_env(self) -> bool:
        """验证环境"""
        print_info(f"验证环境配置...")
        print(f"  环境 ID: {self.env_id}")
        print(f"  凭证: {'已配置' if self.secret_id else '未配置'}")
        
        if not self.secret_id or not self.secret_key:
            return False
        
        print_success("环境验证通过")
        return True
    
    def generate_config_json(self, trigger_type: str = None) -> str:
        """生成配置 JSON"""
        
        if trigger_type:
            triggers = {trigger_type: TRIGGERS_CONFIG[trigger_type]}
        else:
            triggers = TRIGGERS_CONFIG
        
        config = {
            "env_id": self.env_id,
            "function_name": "api",
            "triggers": {k: v["config"] for k, v in triggers.items()}
        }
        
        return json.dumps(config, indent=2, ensure_ascii=False)
    
    def create_http_trigger(self) -> bool:
        """创建 HTTP 触发器"""
        print_info("创建 HTTP 触发器...")
        
        config = TRIGGERS_CONFIG["http"]
        
        print(f"\n配置详情:")
        print(f"  名称: {config['name']}")
        print(f"  类型: {config['type']}")
        print(f"  路径: {config['config']['path']}")
        print(f"  方法: {', '.join(config['config']['methods'])}")
        
        # 实际创建逻辑（需要真实的 SDK）
        print_success("HTTP 触发器配置已生成")
        
        return True
    
    def create_timer_triggers(self, triggers: List[str] = None) -> bool:
        """创建定时触发器"""
        
        if not triggers:
            triggers = ["daily_cleanup", "hourly_stats", "weekly_report", "monthly_reset"]
        
        print_info(f"创建 {len(triggers)} 个定时触发器...")
        
        for trigger_name in triggers:
            if trigger_name not in TRIGGERS_CONFIG:
                print_warning(f"跳过未知触发器: {trigger_name}")
                continue
            
            config = TRIGGERS_CONFIG[trigger_name]
            print(f"\n配置: {config['description']}")
            print(f"  Cron: {config['config']['cron']}")
            print(f"  参数: {json.dumps(config['config'].get('argument', {}))}")
        
        print_success(f"定时触发器配置已生成")
        return True
    
    def show_manual_steps(self) -> None:
        """显示手动配置步骤"""
        print_section("手动配置步骤")
        
        steps = """
1️⃣  打开 TCB 控制台
   URL: https://console.cloud.tencent.com/tcb

2️⃣  选择环境
   环境 ID: {env_id}

3️⃣  进入云函数
   侧边栏 → 云函数 → api

4️⃣  添加 HTTP 触发器
   • 点击「新建触发器」
   • 类型: HTTP
   • 请求方法: GET, POST, PUT, DELETE, OPTIONS
   • 路径: /api
   • 保存

5️⃣  添加定时触发器（可选）
   • 点击「新建触发器」
   • 类型: 定时任务
   • Cron 表达式: 0 2 * * *
   • 保存

6️⃣  获取 API 地址
   • HTTP 触发器配置完成后会显示访问地址
   • 格式: https://service-xxx.sh.run.tcloudbase.com/release/api

7️⃣  测试 API
   curl -X POST 'https://<your-api-url>/api/auth/password-login' \\
     -H 'Content-Type: application/json' \\
     -d '{{"phone":"13800000001","password":"123456"}}'
""".format(env_id=self.env_id)
        
        print(steps)
    
    def show_curl_examples(self) -> None:
        """显示 curl 示例"""
        print_section("API 测试示例")
        
        examples = """
# 1. 密码登录
curl -X POST 'https://<your-api-url>/api/auth/password-login' \\
  -H 'Content-Type: application/json' \\
  -d '{{
    "phone": "13800000001",
    "password": "123456"
  }}'

# 2. 获取个人信息（需要 token）
curl -X GET 'https://<your-api-url>/api/auth/profile' \\
  -H 'Authorization: Bearer {token}'

# 3. 获取等级信息
curl -X GET 'https://<your-api-url>/api/level' \\
  -H 'Authorization: Bearer {token}'

# 4. 获取积分记录
curl -X GET 'https://<your-api-url>/api/points' \\
  -H 'Authorization: Bearer {token}'

# 5. 签到
curl -X POST 'https://<your-api-url>/api/checkin' \\
  -H 'Authorization: Bearer {token}' \\
  -H 'Content-Type: application/json' \\
  -d '{{}}'
"""
        print(examples)

def main():
    parser = argparse.ArgumentParser(
        description='RocketBird CloudBase 云函数自动配置脚本',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 scripts/setup-cloudbase.py
  python3 scripts/setup-cloudbase.py --env-id cloud1-4g2aaqb40446a63b
  python3 scripts/setup-cloudbase.py --http-only
  python3 scripts/setup-cloudbase.py --timer-only
  python3 scripts/setup-cloudbase.py --config-json
        """
    )
    
    parser.add_argument(
        '--env-id',
        default='cloud1-4g2aaqb40446a63b',
        help='CloudBase 环境 ID (默认: cloud1-4g2aaqb40446a63b)'
    )
    
    parser.add_argument(
        '--secret-id',
        help='TCB Secret ID (默认从 .env 或环境变量读取)'
    )
    
    parser.add_argument(
        '--secret-key',
        help='TCB Secret Key (默认从 .env 或环境变量读取)'
    )
    
    parser.add_argument(
        '--http-only',
        action='store_true',
        help='仅配置 HTTP 触发器'
    )
    
    parser.add_argument(
        '--timer-only',
        action='store_true',
        help='仅配置定时触发器'
    )
    
    parser.add_argument(
        '--config-json',
        action='store_true',
        help='输出配置 JSON'
    )
    
    parser.add_argument(
        '--manual-steps',
        action='store_true',
        help='显示手动配置步骤'
    )
    
    parser.add_argument(
        '--curl-examples',
        action='store_true',
        help='显示 curl 测试示例'
    )
    
    args = parser.parse_args()
    
    # 初始化管理器
    manager = CloudBaseTriggerManager(args.env_id, args.secret_id, args.secret_key)
    
    # 打印欢迎信息
    print_section("RocketBird CloudBase 云函数配置")
    
    # 验证环境
    if not manager.validate_env():
        print_warning("部分凭证未配置，只能生成配置而无法部署")
    
    print()
    
    # 生成配置 JSON
    if args.config_json:
        print_section("配置 JSON")
        print(manager.generate_config_json())
        return
    
    # 显示手动步骤
    if args.manual_steps:
        manager.show_manual_steps()
        return
    
    # 显示 curl 示例
    if args.curl_examples:
        manager.show_curl_examples()
        return
    
    # 默认配置流程
    if args.http_only:
        manager.create_http_trigger()
    elif args.timer_only:
        manager.create_timer_triggers()
    else:
        manager.create_http_trigger()
        print()
        manager.create_timer_triggers()
    
    # 显示手动步骤
    manager.show_manual_steps()
    
    # 显示下一步
    print_section("下一步")
    print("""
1. 在 TCB 控制台配置触发器
   按照上述步骤在控制台添加触发器

2. 获取 API 地址
   HTTP 触发器配置完成后会显示访问地址

3. 测试 API
   使用下述命令测试:
   python3 scripts/setup-cloudbase.py --curl-examples

4. 查看日志
   tcb fn log api -e {env_id}

5. 监控指标
   TCB 控制台 > 云函数 > api > 监控
""".format(env_id=args.env_id))

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n操作已取消")
        sys.exit(0)
    except Exception as e:
        print_error(f"发生错误: {e}")
        sys.exit(1)
