#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
GitHub Actions 部署配置检查脚本
用于验证所有必需的配置是否已正确设置
"""

import os
import sys
import subprocess
import json
from pathlib import Path

class ConfigChecker:
    """配置检查器"""
    
    def __init__(self):
        self.checks_passed = 0
        self.checks_failed = 0
        self.workspace_root = Path.cwd()
    
    def print_header(self):
        """打印标题"""
        print("\n" + "="*60)
        print("🔍 GitHub Actions 部署配置检查")
        print("="*60 + "\n")
    
    def check_file(self, path: str, description: str) -> bool:
        """检查文件是否存在"""
        file_path = self.workspace_root / path
        if file_path.exists():
            print(f"✅ {description}: {path}")
            self.checks_passed += 1
            return True
        else:
            print(f"❌ {description}: {path} (不存在)")
            self.checks_failed += 1
            return False
    
    def check_env_var(self, var_name: str, description: str) -> bool:
        """检查环境变量"""
        if os.getenv(var_name):
            value = os.getenv(var_name)
            # 隐藏敏感信息
            if 'SECRET' in var_name or 'PASSWORD' in var_name or 'KEY' in var_name:
                display_value = value[:10] + '...' if len(value) > 10 else '***'
            else:
                display_value = value
            print(f"✅ 环境变量 {var_name}: {display_value}")
            self.checks_passed += 1
            return True
        else:
            print(f"❌ 环境变量 {var_name}: 未设置")
            self.checks_failed += 1
            return False
    
    def check_command(self, cmd: str, description: str) -> bool:
        """检查命令是否可用"""
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                print(f"✅ {description}: 已安装")
                self.checks_passed += 1
                return True
            else:
                print(f"❌ {description}: 不可用")
                self.checks_failed += 1
                return False
        except:
            print(f"❌ {description}: 未找到")
            self.checks_failed += 1
            return False
    
    def check_docker_hub_credentials(self) -> bool:
        """检查 Docker 凭证"""
        print("\n📦 Docker Registry 凭证:")
        print("-" * 40)
        
        username_set = os.getenv('TENCENT_DOCKER_USERNAME')
        password_set = os.getenv('TENCENT_DOCKER_PASSWORD')
        
        if username_set:
            print(f"✅ Docker Username: 已设置")
            self.checks_passed += 1
        else:
            print(f"❌ Docker Username: 未设置")
            self.checks_failed += 1
        
        if password_set:
            print(f"✅ Docker Password: 已设置")
            self.checks_passed += 1
        else:
            print(f"❌ Docker Password: 未设置")
            self.checks_failed += 1
        
        return username_set and password_set
    
    def check_tcb_credentials(self) -> bool:
        """检查 TCB 凭证"""
        print("\n🌐 TCB 凭证:")
        print("-" * 40)
        
        secret_id = os.getenv('TENCENT_SECRET_ID')
        secret_key = os.getenv('TENCENT_SECRET_KEY')
        
        if secret_id:
            print(f"✅ TCB Secret ID: 已设置")
            self.checks_passed += 1
        else:
            print(f"❌ TCB Secret ID: 未设置")
            self.checks_failed += 1
        
        if secret_key:
            print(f"✅ TCB Secret Key: 已设置")
            self.checks_passed += 1
        else:
            print(f"❌ TCB Secret Key: 未设置")
            self.checks_failed += 1
        
        return secret_id and secret_key
    
    def check_github_repo_files(self) -> bool:
        """检查 GitHub 仓库文件"""
        print("\n📁 GitHub 仓库文件:")
        print("-" * 40)
        
        files_to_check = [
            (".github/workflows/deploy-to-tcb-container.yml", "GitHub Actions 工作流"),
            ("Dockerfile", "Docker 构建文件"),
            ("scripts/deploy-tcb-container.sh", "TCB 部署脚本（Bash）"),
            ("scripts/deploy-tcb-container.py", "TCB 部署脚本（Python）"),
            (".env.local", "环境变量配置"),
            (".gitignore", "Git 忽略规则"),
        ]
        
        all_exist = True
        for file_path, description in files_to_check:
            if not self.check_file(file_path, description):
                all_exist = False
        
        return all_exist
    
    def check_required_commands(self) -> bool:
        """检查必需的命令"""
        print("\n🛠️  系统命令:")
        print("-" * 40)
        
        commands = [
            ("git --version", "Git"),
            ("node --version", "Node.js"),
            ("npm --version", "NPM"),
            ("yarn --version", "Yarn"),
            ("docker --version", "Docker"),
            ("python3 --version", "Python 3"),
            ("tcb --version", "TCB CLI"),
        ]
        
        all_available = True
        for cmd, name in commands:
            if not self.check_command(cmd, name):
                all_available = False
        
        return all_available
    
    def generate_setup_commands(self):
        """生成设置命令"""
        print("\n📋 可能需要的设置命令:")
        print("-" * 40)
        
        missing_commands = []
        
        commands = [
            ("docker --version", "Docker", "https://docs.docker.com/get-docker/"),
            ("tcb --version", "TCB CLI", "npm install -g @cloudbase/cli"),
        ]
        
        for cmd, name, install_info in commands:
            try:
                subprocess.run(
                    cmd,
                    shell=True,
                    capture_output=True,
                    timeout=5
                )
            except:
                print(f"安装 {name}:")
                print(f"  {install_info}\n")
    
    def print_github_secrets_guide(self):
        """打印 GitHub Secrets 配置指南"""
        print("\n🔐 GitHub Secrets 配置指南:")
        print("-" * 40)
        print("""
需要在 GitHub 仓库中配置以下 Secrets：
https://github.com/Angus1976/jianshen01/settings/secrets/actions

必需的 Secrets：
┌─────────────────────────────┬─────────────────────────────────┐
│ Secret 名称                  │ 说明                            │
├─────────────────────────────┼─────────────────────────────────┤
│ TENCENT_DOCKER_USERNAME     │ 腾讯云账号 ID                   │
│ TENCENT_DOCKER_PASSWORD     │ CCR 访问令牌（不是登录密码）    │
│ TENCENT_SECRET_ID           │ TCB API 密钥 ID                 │
│ TENCENT_SECRET_KEY          │ TCB API 密钥                    │
└─────────────────────────────┴─────────────────────────────────┘

获取凭证：
1. Docker 凭证:
   腾讯云控制台 → CCR → 命名空间管理 → rocketbird → 生成访问令牌

2. TCB 凭证:
   腾讯云控制台 → 访问管理 → 用户 → 用户详情 → API 密钥

3. 添加 Secrets:
   打开上面的链接，点击 "New repository secret"，添加每个 Secret
        """)
    
    def print_summary(self):
        """打印总结"""
        total = self.checks_passed + self.checks_failed
        
        print("\n" + "="*60)
        print("📊 检查总结")
        print("="*60)
        print(f"✅ 通过: {self.checks_passed}/{total}")
        print(f"❌ 失败: {self.checks_failed}/{total}")
        
        if self.checks_failed == 0:
            print("\n🎉 所有检查通过！可以开始部署了！\n")
        else:
            print(f"\n⚠️  还有 {self.checks_failed} 个检查失败，请按照上面的指导修复\n")
        
        print("="*60 + "\n")
    
    def run(self):
        """运行所有检查"""
        self.print_header()
        
        # 加载环境变量
        try:
            from dotenv import load_dotenv
            load_dotenv('.env.local')
        except ImportError:
            print("⚠️  python-dotenv 未安装，跳过 .env 文件加载\n")
        
        # 执行检查
        self.check_github_repo_files()
        print()
        self.check_required_commands()
        print()
        self.check_docker_hub_credentials()
        self.check_tcb_credentials()
        
        # 打印指南
        self.print_github_secrets_guide()
        
        # 打印总结
        self.print_summary()
        
        return self.checks_failed == 0

def main():
    """主函数"""
    checker = ConfigChecker()
    success = checker.run()
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
