"""
cron: 0 */5 * * * ?
new Env('fuxiaoquan jiankong');
"""

import time
import os
import json
import notify
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# 需要获取aid=xxxx&memberId=xxxx&ruleCode=xxxxx&channelCode=xxxx&paytype=x&pageRecorded=true&mid={mid}&tc={tc}&onetc={onetc}"
# ==================== 监控列表 ====================
# 这是商品详情页的URL模板
DETAIL_PAGE_URL_TEMPLATE = "https://dev.coc.10086.cn/coc3/canvas/rightsmarket-h5-canvas/online/detail?aid=xxx&memberId=xxx&ruleCode=xxxx&channelCode=xxx&paytype=x&pageRecorded=true&mid={mid}&tc={tc}&onetc={onetc}"

# 这是我们要监控的后端API的URL
API_URL_TO_INTERCEPT = "https://dev.coc.10086.cn/coc3/coc3-market-activity/arrange/getProductByActivityId"

# 监控的商品列表
MONITOR_LIST = [
    {
        "name": "Alipay 15元⚡️费",
        "mid": "22373",
        "tc": "9732",
        "onetc": "2980"
    },
    {
        "name": "Wechat 20元⚡️费",
        "mid": "22559",
        "tc": "2990",
        "onetc": "9735"
    }
]
# ==================== 核心功能 (使用 Playwright) ====================
def check_stock(page, current_item):
    """使用 Playwright 访问前端页面并拦截API请求来检查库存"""
    url = DETAIL_PAGE_URL_TEMPLATE.format(mid=current_item['mid'], tc=current_item['tc'], onetc=current_item['onetc'])
    
    try:
        print(f"\n--- 正在检查: {current_item['name']} ---")
        
        stock = -1 

        def handle_response(response):
            nonlocal stock
            if API_URL_TO_INTERCEPT in response.url and response.ok:
                try:
                    data = response.json()
                    all_goods = data.get('data', {}).get('list', [])
                    found = False
                    for good_info in all_goods:
                        if str(good_info.get('mid')) == current_item['mid']:
                            stock_text = good_info.get('availableNum', '-1')
                            stock = int(stock_text)
                            found = True
                            break
                    if not found and stock == -1:
                        print(f"❌ 在API返回的列表中未找到商品ID: {current_item['mid']}")
                except (json.JSONDecodeError, ValueError) as e:
                    print(f"解析拦截到的JSON时出错: {e}")
                    stock = -2

        page.on("response", handle_response)
        page.goto(url, wait_until='networkidle', timeout=30000)
        page.remove_listener("response", handle_response)

        if stock >= 0:
            print(f"✅ 成功获取库存: {stock}")
            if stock > 0:
                title = f"🎉 {current_item['name']} 有货啦！"
                content = f"""商品名称: {current_item['name']}
库存数量: {stock}
请尽快前往兑换！"""
                print("发现库存 > 0，准备发送通知...")
                notify.send(title, content)
        elif stock == -1:
            print("❌ 未能截获到或在返回数据中找到有效的库存信息。")
        elif stock == -2:
            print("❌ 截获到API请求，但解析JSON内容失败。")

    except PlaywrightTimeoutError:
        print("❌ 页面加载超时，请检查网络或目标网站是否可用。")
    except Exception as e:
        print(f"❌ 发生未知错误: {e}")

# ==================== 主程序 ====================
def main():
    # 直接使用脚本中定义的监控列表
    monitor_list = MONITOR_LIST

    is_ql_env = 'QL_DIR' in os.environ or 'DEBIAN_FRONTEND' in os.environ
    with sync_playwright() as p:
        browser_args = ['--no-sandbox'] if is_ql_env else []
        try:
            browser = p.chromium.launch(headless=True, args=browser_args)
        except Exception as e:
            print(f"""❌ 启动浏览器失败: {e}
🤔 可能是 Playwright 浏览器驱动未安装。
请尝试在终端运行 `playwright install` 命令来安装。""")
            return
            
        # 设置一个常见的 User-Agent
        user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/13.0 MQQBrowser/10.1.1 Mobile/15B87 Safari/604.1 QBWebViewUA/2 QBWebViewType/1 WKType/1"
        
        page = browser.new_page(user_agent=user_agent)
        for item in monitor_list:
            check_stock(page, item)
            time.sleep(2)

        browser.close()

    print("\n✅ 本次监控结束。")

if __name__ == "__main__":
    main()
