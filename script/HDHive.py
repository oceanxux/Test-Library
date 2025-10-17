"""
(HDHive)签到脚本
cron: 8 47 11 * * *
"""
"""
使用方法:
1. 在青龙面板 -> 依赖管理 -> Python3 中，添加以下依赖：
   - requests
   - pyjwt  (注意: 安装时用 pyjwt, 导入时用 jwt)
   - pytz

2. 在青龙面板 -> 配置文件 中，添加以下环境变量：
   - HDHIVE_COOKIES: 必填，影巢的Cookie，支持多账号。
     格式: 单账号 "token=xxx;csrf_access_token=yyy;"
     格式: 多账号 "token=xxx;csrf_access_token=yyy;@token=aaa;csrf_access_token=bbb;"
     (多账号用 '@' 分隔)
   - HDHIVE_BASE_URL: 选填，影巢的站点地址，默认为 "https://hdhive.com/"。如果域名变更，请修改此项。
   - HDHIVE_MAX_RETRIES: 选填，签到失败时的最大重试次数，默认为 3。
   - HDHIVE_RETRY_INTERVAL: 选填，每次重试的间隔时间（秒），默认为 30。

"""
import time
import requests
import re
import json
import os
from datetime import datetime
from urllib3.exceptions import InsecureRequestWarning
import urllib3
import jwt

# 禁用 InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)

# --- 全局配置 ---
# 从环境变量获取配置，如果获取不到则使用默认值
HDHIVE_COOKIES = os.environ.get("HDHIVE_COOKIES", "")
BASE_URL = os.environ.get("HDHIVE_BASE_URL", "https://hdhive.com").rstrip("/")
MAX_RETRIES = int(os.environ.get("HDHIVE_MAX_RETRIES", 3))
RETRY_INTERVAL = int(os.environ.get("HDHIVE_RETRY_INTERVAL", 30))

# --- 通知服务 ---
# 默认为空，稍后会尝试导入青龙的通知服务
notify = None
try:
    from notify import send
    notify = send
except ImportError:
    print("位于非青龙环境，无法导入 notify.py，通知功能将不会生效")

def send_notification(title, content):
    """
    发送通知的统一函数
    """
    if notify:
        try:
            notify(title, content)
        except Exception as e:
            print(f"调用通知服务失败: {e}")
    
    # 无论如何，都在控制台打印一份
    print("\n--- 签到结果通知 ---")
    print(f"标题: {title}")
    print(f"内容:\n{content}")
    print("---------------------\n")
    
    if not notify:
        print("无推送渠道，请检查通知变量是否正确")

class HdhiveSigner:
    """
    封装了影巢签到逻辑的类
    """
    def __init__(self, cookie):
        self._cookie_str = cookie
        self._cookie_dict = self._parse_cookie(cookie)
        self._base_url = BASE_URL
        self._site_url = f"{self._base_url}/"
        self._signin_api = f"{self._base_url}/api/customer/user/checkin"
        self.user_id = self._get_user_id_from_token()
        self._user_info_api = f"{self._base_url}/user/{self.user_id}"

    def _parse_cookie(self, cookie_str):
        """
        将Cookie字符串解析为字典
        """
        cookies = {}
        for item in cookie_str.split(';'):
            if '=' in item:
                name, value = item.strip().split('=', 1)
                cookies[name] = value
        return cookies
    
    def _get_user_id_from_token(self):
        """
        从Cookie的token中解析用户ID
        """
        token = self._cookie_dict.get('token')
        if not token:
            return "未知用户"
        try:
            decoded_token = jwt.decode(token, options={"verify_signature": False, "verify_exp": False})
            user_id = decoded_token.get('sub', '未知用户')
            return user_id
        except Exception as e:
            print(f"从Token解析用户ID失败: {e}")
            return "未知用户"

    def sign(self):
        """
        执行签到操作，包含重试逻辑
        """
        for i in range(MAX_RETRIES + 1):
            try:
                state, message = self._signin_base()
                if state:
                    print(f"用户 {self.user_id} 签到成功: {message}")
                    return True, message
                else:
                    # 如果是已经签到过的提示，也视为成功
                    if "已经签到" in message or "签到过" in message:
                        print(f"用户 {self.user_id} 今日已签到: {message}")
                        return True, message
                    
                    print(f"用户 {self.user_id} 签到失败: {message}")
                    if i < MAX_RETRIES:
                        print(f"{RETRY_INTERVAL}秒后进行第 {i+1}/{MAX_RETRIES} 次重试...")
                        time.sleep(RETRY_INTERVAL)
            
            except requests.RequestException as req_exc:
                print(f"用户 {self.user_id} 签到时发生网络请求异常: {req_exc}")
                if i < MAX_RETRIES:
                    print(f"{RETRY_INTERVAL}秒后进行第 {i+1}/{MAX_RETRIES} 次重试...")
                    time.sleep(RETRY_INTERVAL)

            except Exception as e:
                print(f"用户 {self.user_id} 签到时发生未知错误: {str(e)}")
                # 发生未知错误时，通常不建议重试
                return False, str(e)

        return False, "所有重试均失败"

    def _signin_base(self):
        """
        执行签到的核心网络请求
        """
        token = self._cookie_dict.get('token')
        csrf_token = self._cookie_dict.get('csrf_access_token')

        if not token:
            return False, "Cookie中缺少 'token'"

        referer = f"{self._base_url}/user/{self.user_id}" if self.user_id != "未知用户" else self._site_url
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Origin': self._base_url,
            'Referer': referer,
            'Authorization': f'Bearer {token}',
        }
        if csrf_token:
            headers['x-csrf-token'] = csrf_token

        signin_res = requests.post(
            url=self._signin_api,
            headers=headers,
            cookies=self._cookie_dict,
            timeout=30,
            verify=False
        )

        if signin_res is None:
            return False, '签到请求无响应，请检查代理或网络环境'

        try:
            signin_result = signin_res.json()
        except json.JSONDecodeError:
            return False, f'API响应非JSON格式 (状态码 {signin_res.status_code}): {signin_res.text[:200]}'

        message = signin_result.get('message', '无明确消息')
        
        if signin_result.get('success'):
            return True, message

        if "已经签到" in message or "签到过" in message:
            return True, message 
        
        return False, message

    def get_user_stats(self):
        """
        获取用户统计信息，如积分、签到天数等 (通过解析HTML)
        """
        if self.user_id == "未知用户":
            return None

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Referer': self._base_url,
        }

        try:
            res = requests.get(self._user_info_api, headers=headers, cookies=self._cookie_dict, timeout=30, verify=False)
            res.raise_for_status()
            html_content = res.text

            points_match = re.search(r'>当前积分</div><div class="[^"]+">(\d+)</div>', html_content)
            days_match = re.search(r'>累计签到</div><div class="[^"]+">(\d+)', html_content)
            user_match = re.search(r'<p class="MuiTypography-root MuiTypography-body1 mui-hy05e4">([^<]+)</p>', html_content)

            points = points_match.group(1) if points_match else 'N/A'
            checkin_days = days_match.group(1) if days_match else 'N/A'
            username = user_match.group(1) if user_match else self.user_id

            stats = {
                "points": points,
                "checkin_days": checkin_days,
                "username": username
            }
            return stats

        except requests.RequestException as e:
            print(f"获取用户 {self.user_id} 页面时发生网络错误: {e}")
            return None
        except Exception as e:
            print(f"解析用户 {self.user_id} 页面时发生未知错误: {e}")
            return None

def main():
    """
    主函数
    """
    if not HDHIVE_COOKIES:
        print("错误：未找到环境变量 HDHIVE_COOKIES，请先配置！")
        send_notification("影巢签到失败", "未配置Cookie环境变量，脚本无法运行。")
        return

    # 支持多账号，使用 @ 分隔
    cookie_list = [cookie.strip() for cookie in HDHIVE_COOKIES.split('@') if cookie.strip()]
    
    print(f"检测到 {len(cookie_list)} 个影巢账号，开始执行签到...")
    
    all_success = True
    summary = []

    for idx, cookie in enumerate(cookie_list, 1):
        print(f"\n--- [账号 {idx}] ---")
        signer = HdhiveSigner(cookie)
        success, message = signer.sign()
        user_display_name = signer.user_id # 默认显示ID

        status = "✅ 成功" if success else "❌ 失败"
        
        summary_line = f"账号 {user_display_name}: {status}\n详情: {message}"

        if success:
            stats = signer.get_user_stats()
            if stats:
                user_display_name = stats.get('username', signer.user_id)
                summary_line = f"账号 {user_display_name}: {status}\n详情: {message}"
                summary_line += f"\n当前积分: {stats['points']} | 累计签到: {stats['checkin_days']}天"
        
        summary.append(summary_line)
        
        if not success:
            all_success = False
            
    # --- 生成并发送最终通知 ---
    notification_title = "影巢签到通知"
    notification_content = "\n\n".join(summary)
    
    if all_success:
        print("\n🎉 所有账号签到成功！")
    else:
        print("\n⚠️ 部分账号签到失败，请检查日志！")

    send_notification(notification_title, notification_content)

if __name__ == "__main__":
    main()
