# -- coding: utf-8 --
"""
cron: 0 15 */7 * *
new Env('Serv007 保活脚本');
"""
import os
import paramiko   #需要安装依赖 在pyhton 下
import sys
import time  

try:
    import notify
except ImportError:
    print("错误：无法导入 notify 模块，请确保 notify.py 存在且路径正确。")
    sys.exit(1)

def try_ssh_connection(server, username, password, label):
    """
    尝试通过 SSH 连接服务器
    """
    message = ""
    print(f"正在尝试连接到 {server}，用户名：{username}（连接标签：{label}）")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        # 连接服务器
        client.connect(
            hostname=server,
            username=username,
            password=password,
            timeout=30,
        )
        # 执行命令
        stdin, stdout, stderr = client.exec_command("echo 'Hello from {label}'; date")
        output = stdout.read().decode().strip()
        print(output)
        message = f"✅ [SSH S7] {label} 连接成功！\n🔗 连接到: {server}\n👤 用户名: {username}\n🌐 面板地址: https://panel7.serv00.com/"
    except paramiko.ssh_exception.AuthenticationException:
        print(f"错误：{label} 身份验证失败！")
        message = f"❌ [SSH 保活通知] {label} 身份验证失败！"
    except paramiko.ssh_exception.SSHException as e:
        print(f"错误：{label} SSH 错误：{e}")
        message = f"❌ [SSH S7 保活通知] {label} SSH 错误！"
    except Exception as e:
        print(f"错误：{label} 连接失败：{e}")
        message = f"❌ [SSH S7 保活通知] {label} 连接失败！"
    finally:
        client.close()

    # 使用 notify.py 发送消息
    try:
        notify.send("SSH S7 保活通知", message)
    except Exception as e:
        print(f"错误：通知发送失败：{e}")
    print("通知已处理。")
    time.sleep(3)  # 确保使用 time.sleep

# 配置 SSH 连接信息
connections = [
    {"server": "s7.serv00.com", "username": "username1", "password": "password1", "label": "S7-连接1"},
    {"server": "s7.serv00.com", "username": "username2", "password": "password2", "label": "S7-连接2"},
]

# 尝试所有连接
for conn in connections:
    try_ssh_connection(conn["server"], conn["username"], conn["password"], conn["label"])

print("所有 SSH 连接尝试已完成。")
