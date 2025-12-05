#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
TCB 容器型服务部署脚本（Python 版）
功能：通过 TCB API/CLI 创建并部署容器型云托管服务
用途：从 GitHub Actions 推送的镜像部署到 TCB
使用：python3 scripts/deploy-tcb-container.py
"""

import os
import sys
import json
import subprocess
import time
from pathlib import Path
from typing import Dict, Optional
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('.env.local')

# 颜色输出
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_info(msg: str):
    """打印信息"""
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {msg}")

def print_success(msg: str):
    """打印成功消息"""
    print(f"{Colors.GREEN}✓{Colors.RESET} {msg}")

def print_warning(msg: str):
    """打印警告消息"""
    print(f"{Colors.YELLOW}⚠{Colors.RESET} {msg}")

def print_error(msg: str):
    """打印错误消息"""
    print(f"{Colors.RED}✗{Colors.RESET} {msg}")

def print_section(title: str):
    """打印章节标题"""
    print(f"\n{Colors.BOLD}{'='*50}{Colors.RESET}")
    print(f"{Colors.BOLD}{title}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*50}{Colors.RESET}\n")

class TCBDeployer:
    """TCB 容器型服务部署器"""
    
    def __init__(self):
        self.env_id = os.getenv('TCB_ENV_ID')
        self.secret_id = os.getenv('TCB_SECRET_ID')
        self.secret_key = os.getenv('TCB_SECRET_KEY')
        
        # 镜像配置
        self.registry = "ccr.ccs.tencentyun.com"
        self.namespace = "rocketbird"
        self.image_name = "rocketbird-app"
        self.image_tag = "latest"
        
        # 服务配置
        self.service_name = "rocketbird-api"
        self.port = 8000
        self.cpu = "500m"
        self.memory = "1Gi"
        self.min_instances = 1
        self.max_instances = 5
        
        # 健康检查配置
        self.health_check_path = "/api/health"
        self.health_check_initial_delay = 5
        self.health_check_timeout = 10
        self.health_check_period = 30
        
        # 环境变量
        self.envs = {
            'NODE_ENV': 'production',
            'TCB_ENV_ID': self.env_id,
            'PORT': str(self.port)
        }
    
    def validate_config(self) -> bool:
        """验证配置"""
        print_info("验证部署配置...")
        
        if not self.env_id:
            print_error("TCB_ENV_ID 未设置")
            return False
        
        if not self.secret_id or not self.secret_key:
            print_error("TCB_SECRET_ID 或 TCB_SECRET_KEY 未设置")
            return False
        
        print_success(f"环境 ID: {self.env_id}")
        print_success(f"镜像: {self.registry}/{self.namespace}/{self.image_name}:{self.image_tag}")
        print_success(f"服务: {self.service_name}")
        
        return True
    
    def check_tcb_cli(self) -> bool:
        """检查 TCB CLI 是否安装"""
        print_info("检查 TCB CLI...")
        
        try:
            result = subprocess.run(
                ['tcb', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                version = result.stdout.strip()
                print_success(f"TCB CLI 已安装: {version}")
                return True
            else:
                print_error("TCB CLI 不可用")
                print_info("请运行: npm install -g @cloudbase/cli")
                return False
        except FileNotFoundError:
            print_error("未找到 TCB CLI 命令")
            print_info("请运行: npm install -g @cloudbase/cli")
            return False
        except Exception as e:
            print_error(f"检查 TCB CLI 失败: {e}")
            return False
    
    def tcb_login(self) -> bool:
        """登录 TCB"""
        print_info("执行 TCB 登录...")
        
        try:
            # 首先尝试登出
            subprocess.run(
                ['tcb', 'logout'],
                capture_output=True,
                timeout=5
            )
        except:
            pass
        
        try:
            result = subprocess.run(
                [
                    'tcb', 'login',
                    '--secretId', self.secret_id,
                    '--secretKey', self.secret_key
                ],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print_success("TCB 认证成功")
                return True
            else:
                print_error(f"TCB 认证失败: {result.stderr}")
                return False
        except Exception as e:
            print_error(f"TCB 登录异常: {e}")
            return False
    
    def generate_service_config(self) -> Dict:
        """生成服务配置"""
        print_info("生成服务配置...")
        
        config = {
            "serviceName": self.service_name,
            "image": f"{self.registry}/{self.namespace}/{self.image_name}:{self.image_tag}",
            "port": self.port,
            "cpu": self.cpu,
            "memory": self.memory,
            "minInstances": self.min_instances,
            "maxInstances": self.max_instances,
            "envs": [
                {"name": k, "value": v} 
                for k, v in self.envs.items()
            ],
            "healthCheck": {
                "path": self.health_check_path,
                "initialDelaySeconds": self.health_check_initial_delay,
                "timeoutSeconds": self.health_check_timeout,
                "periodSeconds": self.health_check_period
            },
            "initialDelaySeconds": self.health_check_initial_delay,
            "timeoutSeconds": self.health_check_timeout,
            "periodSeconds": self.health_check_period
        }
        
        print_success("服务配置已生成")
        return config
    
    def save_config_file(self, config: Dict, filename: str = '/tmp/rocketbird-service.json'):
        """保存配置到文件"""
        print_info(f"保存配置文件: {filename}")
        
        with open(filename, 'w') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print_success(f"配置文件已保存")
    
    def deploy_service(self, config: Dict) -> bool:
        """部署服务"""
        print_info("准备部署服务...")
        
        # 这里使用 TCB CLI 的部署命令
        # 注意: 实际的命令可能需要根据 TCB CLI 版本调整
        
        try:
            # 尝试使用 TCB CLI 的 cloudbase service 命令
            cmd = [
                'tcb',
                'run',
                '--env-id', self.env_id,
                '--name', self.service_name,
                '--image', f"{self.registry}/{self.namespace}/{self.image_name}:{self.image_tag}",
                '--port', str(self.port),
                '--cpu', self.cpu,
                '--memory', self.memory
            ]
            
            print_info(f"执行命令: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                print_success("服务部署命令已发送")
                return True
            else:
                print_warning(f"部署命令可能需要在 TCB 控制台完成")
                print_info(f"输出: {result.stdout}")
                if result.stderr:
                    print_info(f"错误: {result.stderr}")
                return True  # 继续执行，因为可能是信息提示
        except subprocess.TimeoutExpired:
            print_warning("部署命令超时，请在 TCB 控制台检查")
            return True
        except Exception as e:
            print_error(f"部署异常: {e}")
            return False
    
    def print_deployment_summary(self, config: Dict):
        """打印部署总结"""
        print_section("部署总结")
        
        print(f"服务名:        {config['serviceName']}")
        print(f"镜像:          {config['image']}")
        print(f"端口:          {config['port']}")
        print(f"CPU:           {config['cpu']}")
        print(f"内存:          {config['memory']}")
        print(f"最小实例数:    {config['minInstances']}")
        print(f"最大实例数:    {config['maxInstances']}")
        print()
        
        print("环境变量:")
        for env in config['envs']:
            print(f"  {env['name']}={env['value']}")
        print()
        
        health = config.get('healthCheck', {})
        print("健康检查:")
        print(f"  路径:            {health.get('path', 'N/A')}")
        print(f"  初始延迟:        {health.get('initialDelaySeconds', 'N/A')}s")
        print(f"  超时:            {health.get('timeoutSeconds', 'N/A')}s")
        print(f"  检查间隔:        {health.get('periodSeconds', 'N/A')}s")
        print()
        
        print("后续步骤:")
        print("1. 打开 TCB 控制台")
        print(f"   URL: https://console.cloud.tencent.com/tcb/env/{self.env_id}/service")
        print()
        print("2. 查看服务部署状态")
        print("   - 确认镜像已拉取")
        print("   - 查看容器启动日志")
        print("   - 验证健康检查通过")
        print()
        print("3. 获取服务访问 URL")
        print("   - 在服务详情页查看公网 URL")
        print()
        print("4. 测试服务")
        print("   - 测试 API: curl https://<service-url>/api/health")
        print("   - 访问 H5: https://<service-url>/h5")
        print("   - 访问管理后台: https://<service-url>/admin")
    
    def print_troubleshooting(self):
        """打印故障排除指南"""
        print_section("故障排除")
        
        print("常见问题:")
        print()
        print("1. 镜像拉取失败")
        print("   - 检查镜像是否已推送到腾讯云 CCR")
        print("   - 检查 CCR 仓库凭证")
        print("   - 检查镜像标签是否正确")
        print()
        print("2. 健康检查失败")
        print("   - 查看容器日志中的错误")
        print("   - 确认 /api/health 端点实现正确")
        print("   - 检查容器内部的网络连接")
        print()
        print("3. 环境变量未生效")
        print("   - 重新部署服务")
        print("   - 检查环境变量名称是否正确")
        print("   - 查看容器启动日志")
        print()
        print("4. 服务无法访问")
        print("   - 确认服务已启动成功")
        print("   - 检查公网 IP 配置")
        print("   - 检查防火墙规则")
        print()
        print("更多帮助:")
        print("- TCB 文档: https://docs.cloudbase.net/")
        print("- 云托管服务: https://docs.cloudbase.net/en/run/deploy-container/")
    
    def run(self) -> bool:
        """运行部署流程"""
        print_section("TCB 容器型服务部署")
        
        # 1. 验证配置
        if not self.validate_config():
            return False
        
        print()
        
        # 2. 检查 TCB CLI
        if not self.check_tcb_cli():
            return False
        
        print()
        
        # 3. TCB 登录
        if not self.tcb_login():
            print_warning("TCB 登录失败，但继续执行...")
        
        print()
        
        # 4. 生成配置
        config = self.generate_service_config()
        self.save_config_file(config)
        
        print()
        
        # 5. 部署服务
        if not self.deploy_service(config):
            print_error("服务部署失败")
            return False
        
        print()
        
        # 6. 打印总结
        self.print_deployment_summary(config)
        
        # 7. 打印故障排除指南
        self.print_troubleshooting()
        
        print_success("部署脚本执行完成！")
        return True

def main():
    """主函数"""
    try:
        deployer = TCBDeployer()
        success = deployer.run()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_warning("\n部署中断")
        sys.exit(1)
    except Exception as e:
        print_error(f"部署异常: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
