#!/usr/bin/env python3
"""
剪贴板监听脚本 - 用于电脑B后台运行
自动监听本地剪贴板变化并同步到 LocalShare 服务

用法：
  python clipboard-watcher.py              # 使用默认配置
  python clipboard-watcher.py --port 3000  # 指定端口
  python clipboard-watcher.py --url http://192.168.1.100:5000  # 指定服务地址
"""

import sys
import time
import json
import argparse
import urllib.request
import urllib.error

try:
    import pyperclip
except ImportError:
    print("请先安装 pyperclip: pip install pyperclip")
    sys.exit(1)


def send_to_server(content: str, server_url: str, device_name: str) -> bool:
    """发送内容到服务器"""
    try:
        data = json.dumps({"content": content, "device": device_name}).encode("utf-8")
        req = urllib.request.Request(
            f"{server_url}/api/clipboard",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=3) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result.get("success", False)
    except Exception as e:
        print(f"⚠ 发送失败: {e}")
        return False


def get_from_server(server_url: str) -> dict:
    """从服务器获取内容"""
    try:
        req = urllib.request.Request(f"{server_url}/api/clipboard")
        with urllib.request.urlopen(req, timeout=3) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"⚠ 获取失败: {e}")
        return {"success": False}


def main():
    parser = argparse.ArgumentParser(description="剪贴板监听同步脚本")
    parser.add_argument("--url", default="http://localhost:5000", help="LocalShare 服务地址")
    parser.add_argument("--port", type=int, help="服务端口（与 --url 二选一）")
    parser.add_argument("--device", default="电脑B", help="设备名称")
    parser.add_argument("--interval", type=float, default=0.5, help="检查间隔（秒）")
    args = parser.parse_args()

    # 处理端口参数
    server_url = args.url
    if args.port:
        server_url = f"http://localhost:{args.port}"

    print("\n" + "=" * 50)
    print("  LocalShare 剪贴板监听器")
    print("=" * 50)
    print(f"  服务地址: {server_url}")
    print(f"  设备名称: {args.device}")
    print(f"  检查间隔: {args.interval}秒")
    print("=" * 50)
    print("  按 Ctrl+C 停止")
    print("=" * 50 + "\n")

    last_local_content = pyperclip.paste()
    last_remote_update = 0

    print("✓ 开始监听剪贴板...\n")

    while True:
        try:
            # 1. 检查本地剪贴板变化 → 推送到服务器
            current_local = pyperclip.paste()
            if current_local != last_local_content and current_local:
                last_local_content = current_local
                if send_to_server(current_local, server_url, args.device):
                    print(f"📤 已推送: {len(current_local)} 字符")
                continue

            # 2. 检查服务器更新 → 同步到本地
            result = get_from_server(server_url)
            if result.get("success"):
                data = result.get("data", {})
                remote_update = data.get("updatedAt", 0)
                remote_content = data.get("content", "")
                remote_device = data.get("device", "")

                # 如果服务器有新内容且不是自己发的
                if remote_update > last_remote_update and remote_content and remote_device != args.device:
                    last_remote_update = remote_update
                    last_local_content = remote_content
                    pyperclip.copy(remote_content)
                    print(f"📥 已同步: {len(remote_content)} 字符 (来自 {remote_device})")

        except KeyboardInterrupt:
            print("\n\n已停止监听")
            break
        except Exception as e:
            print(f"⚠ 错误: {e}")

        time.sleep(args.interval)


if __name__ == "__main__":
    main()
