// ==UserScript==
// @name        🌀VIP视频解析
// @namespace   https://greasyfork.org/users/1313123-fei-miao
// @version     2.9.3
// @description 适配手机端与电脑端，可自定义解析网址
// @author      暴走的肥猫
// @icon        data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='_5' x1='32' y1='60.96' x2='32' y2='5.18' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%230087c9'/%3E%3Cstop offset='1' stop-color='%238fe36d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='0' width='64' height='64' rx='13.63' ry='13.63' style='fill:url(%23_5); stroke-width:0px;'/%3E%3Cpath d='M53.14,22.76c1.04-1.28.37-2.32-.1-3.28-7.69-15.14-32.73-14.58-41.2-.5-13.44,19.29,7.69,44.27,28.91,34.61,14.13-6.24,14.32-28.05-.2-33.98-10.14-4.77-23.09,3.29-20.59,14.46,1.05,5.91,7.45,10.54,13.95,8.68,6.93-1.56,7.18-11.47.7-13.57-3.5-1.47-4.42,2.67-1.49,3.99,2.87,2.01.95,5.41-2.19,4.95-13.06-4.66.32-19.8,9.11-12.19,15.65,13.58-7.47,31.84-20.36,18.96C1.06,23.14,32.46.23,53.14,22.76Z' style='fill:%23f8faf9; stroke-width:0px;'/%3E%3C/svg%3E
// @license     GNU AGPLv3
// @match       *://*.youku.com/*
// @match       *://*.iqiyi.com/*
// @match       *://v.qq.com/*
// @match       *://*.v.qq.com/*
// @match       *://*.mgtv.com/*
// @match       *://tv.sohu.com/*
// @match       *://film.sohu.com/*
// @match       *://*.bilibili.com/*
// @match       *://*.tudou.com/*
// @match       *://*.pptv.com/*
// @compatible  safari
// @compatible  chrome
// @compatible  edge
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM.getValue
// @grant       GM.setValue
// @run-at      document-start
// @noframes
// @downloadURL https://update.greasyfork.org/scripts/497422/%F0%9F%8C%80VIP%E8%A7%86%E9%A2%91%E8%A7%A3%E6%9E%90%E2%80%94%E2%80%94fatcat.user.js
// @updateURL https://update.greasyfork.org/scripts/497422/%F0%9F%8C%80VIP%E8%A7%86%E9%A2%91%E8%A7%A3%E6%9E%90%E2%80%94%E2%80%94fatcat.meta.js
// ==/UserScript==
/*jshint esversion: 11 */
(async function () {
    const ACCESS_POINT = [
        { "name": "虾米-1", "url": "https://jx.xmflv.com/?url=" },
        { "name": "虾米-2", "url": "https://jx.xmflv.cc/?url=" },
        { name: "虎牙解析", "url": "https://huyajx.com/play?url=" },
        // 新增接口
        { name: "熊二解析", "url": "http://47.94.240.226:9911/analysis/api/xionger2.php?url=" },
        { name: "火花解析", "url": "https://api.huohua.live/api/?key=m5CK267ypabEU1jBNS&url=" },
        { "name": "1907", "url": "https://im1907.top/?jx=" },
        { "name": "M3U8TV", "url": "https://jx.m3u8.tv/jiexi/?url=" },
        { "name": "夜幕", "url": "https://www.yemu.xyz/?url=" },
        { "name": "777", "url": "https://jx.jsonplayer.com/player/?url=" },
        { "name": "CK", "url": "https://www.ckplayer.vip/jiexi/?url=" },
        { "name": "YT", "url": "https://jx.yangtu.top/?url=" },
        { "name": "Player-JY", "url": "https://jx.playerjy.com/?url=" },
        { "name": "Yparse", "url": "https://jx.yparse.com/index.php?url=" },
        { "name": "8090", "url": "https://www.8090g.cn/?url=" },
        { "name": "剖元", "url": "https://www.pouyun.com/?url=" },
        { "name": "全民", "url": "https://43.240.74.102:4433?url=" },
        { "name": "爱豆", "url": "https://jx.aidouer.net/?url=" },
        { "name": "冰豆", "url": "https://bd.jx.cn/?url=" },
        { "name": "Playm3u8", "url": "https://www.playm3u8.cn/jiexi.php?url=" },
        { "name": "mmkv", "url": "https://jx.mmkv.cn/tv.php?url=" },
    ];
    var searchSelector = ['video'];
    var patches = { 'm.iqiyi.com': () => Object.defineProperty(navigator, 'userAgent', { get: () => 'Android' }) }
    async function getUserConfig(key, defaultVal) {
        return typeof GM_getValue === 'function' ? GM_getValue(key, defaultVal) : GM.getValue(key, defaultVal);
    }
    async function setUserConfig(key, val) {
        return typeof GM_setValue === 'function' ? GM_setValue(key, val) : GM.setValue(key, val);
    }
    function seekSameSizeParentNode(node) {
        let nodeSize = node.getBoundingClientRect();
        let parents = [node];
        while (node.parentNode != document.body) {
            parents.unshift(node.parentNode);
            node = node.parentNode;
        };
        let parentSize;
        let sameSizeParent = parents.find(parent => {
            parentSize = parent.getBoundingClientRect();
            return Math.abs(parentSize.width - nodeSize.width) < 1 && Math.abs(parentSize.height - nodeSize.height) < 1
        });
        return sameSizeParent;
    }
    function useInterval(fn, intervalTime, maxTime) {
        return new Promise((resolve) => {
            let totalTime = 0;
            let interval = setInterval(() => {
                totalTime += intervalTime;
                if (totalTime >= maxTime || fn()) { clearInterval(interval); resolve(); }
            }, intervalTime)
        })
    }
    async function findVideoWrapper() {
        await useInterval(() => Array.from(document.querySelectorAll(searchSelector.join(','))).find(videoNode => {
            if (window.getComputedStyle(videoNode).display == 'none') videoNode.style.display = 'revert';
            return videoNode.getBoundingClientRect().width > 90 && videoNode.getBoundingClientRect().height > 40
        }), 200, Infinity);
        let maxVideoNode = Array.from(document.querySelectorAll(searchSelector.join(','))).reduce((pre, cur) => {
            if (cur.getBoundingClientRect().width > (pre?.getBoundingClientRect().width || 0)) return cur;
            return pre;
        });
        return seekSameSizeParentNode(maxVideoNode);
    }
    async function createVideoFrame(videoWrapper, curAccessPoint) {
        videoWrapper.style.overflow = 'hidden';
        if (window.getComputedStyle(videoWrapper).position == 'static') {
            videoWrapper.style.position = 'relative';
        }
        
        // 清除可能存在的旧播放器
        const oldPlayer = document.querySelector('#fatcat_video_vip_iframe');
        if (oldPlayer) {
            oldPlayer.parentElement.remove();
        }

        let iframeWrapper = document.createElement('div');
        
        // 处理JSON格式的解析接口
        const jsonApis = ["火花解析", "熊二解析"]; // 添加所有返回JSON的接口名称
        
        if (jsonApis.includes(curAccessPoint.name)) {
            try {
                // 获取JSON响应
                const response = await fetch(curAccessPoint.url + window.location.href);
                const data = await response.json();
                
                // 检查返回状态和URL
                if (data.code === "200" && data.url) {
                    // 使用播放器播放解析到的地址
                    const playerUrl = "https://www.playm3u8.cn/player.html?url=" + encodeURIComponent(data.url);
                    
                    iframeWrapper.innerHTML = `
                        <iframe 
                            src="${playerUrl}"
                            width="100%" 
                            height="100%" 
                            allowfullscreen 
                            id="fatcat_video_vip_iframe" 
                            style="
                                border: none;
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                z-index: 99999999;
                            "
                        ></iframe>
                    `;
                } else {
                    throw new Error('解析失败或未获取到播放地址');
                }
            } catch (error) {
                console.error(`${curAccessPoint.name}解析失败:`, error);
                // 解析失败时使用备用解析接口
                iframeWrapper.innerHTML = `
                    <iframe 
                        src="https://jx.xmflv.com/?url=${window.location.href}" 
                        width="100%" 
                        height="100%" 
                        allowfullscreen 
                        id="fatcat_video_vip_iframe" 
                        style="
                            border: none;
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            z-index: 99999999;
                        "
                    ></iframe>
                `;
            }
        } else {
            // 其他解析接口使用原来的方式
            iframeWrapper.innerHTML = `
                <iframe 
                    src="${curAccessPoint ? curAccessPoint.url + window.location.href : ''}" 
                    width="100%" 
                    height="100%" 
                    allowfullscreen 
                    id="fatcat_video_vip_iframe" 
                    style="
                        border: none;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 99999999;
                    "
                ></iframe>
            `;
        }

        iframeWrapper.style = `
            position: absolute;
            inset: 0;
            z-index: 99999999;
            background: #000;
        `;
        
        videoWrapper.appendChild(iframeWrapper);
        
        // 隐藏其他视频元素
        Array.from(videoWrapper.children).forEach(el => {
            if (el !== iframeWrapper) {
                el.style.visibility = 'hidden';
                if (el.tagName === 'VIDEO') {
                    el.pause();
                    el.src = '';
                }
            }
        });
    }
    async function createMenu(accessPoints, curAccessPoint) {
        if (document.querySelector('#fatcat_video_vip')) return;
        let wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div id="fatcat_video_vip" style="bottom: 8px; right: 8px;">
    <style>
        #fatcat_video_vip {
            position: fixed;
            z-index: 99999999;
        }
        #fatcat_video_vip *{
            transition: all ease 0.2s;
        }
        #fatcat_video_vip button {
            all: unset;
        }
        #fatcat_video_vip :is(.block-btn, .fatcat_video_vip_link) {
            display: inline-block;
            vertical-align: middle;
            background: linear-gradient(to top right, #61c400bf 0%, #2ea5ffc2 100%);
            white-space: nowrap;
            width: auto;
            height: 33px;
            padding-inline: 10px;
            font-size: 13px;
            color: white;
            border-radius: 8px;
            text-align: center;
            outline: none;
            border: 1px solid #ffffff57;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            cursor: pointer;
        }
        #fatcat_video_vip_popover {
            background: #191a20eb;
            font-size: 15px;
            margin: auto;
            border-radius: 20px;
            padding: 20px;
            border: none;
            position: fixed;
            bottom: 8px;
            right: 8px;
            max-width: clac(100vw - 10px);
            color: white;
            border: 1px solid #ffffff42;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            white-space: nowrap;
        }
        #fatcat_video_vip_popover input{
            display: inline-block;
            width: 60px;
            height: 33px;
            color: rgba(255,255,255,0.6);
            background-color: #191a20eb!important;
            border: 1px solid #ffffff42;
            padding: 0 10px;
        }
        #fatcat_video_vip .fatcat_video_vip_link{
            width: 17px;
            height: 17px;
            line-height: 17px;
            font-size: 10px;
            padding: 0;
        }
        #fatcat_video_vip_link{
            display: inline-block;
            color: inherit;
            text-decoration: none;
        }
        #fatcat_video_vip_link:hover{
            color: rgba(255,255,255,0.8);
            transform: translateX(2px);
        }
        #fatcat_video_vip_link:hover .fatcat_video_vip_link{
            width: 50px;
        }
    </style>
    <button class="block-btn" id="fatcat_video_vip_setwrapper">📍自选视频位置</button>
    <button class="block-btn" style="font-size: 20px;" id="fatcat_video_vip_popover_toggle_btn">≡</button>
    <div id="fatcat_video_vip_popover" hidden>
        <p style="margin-block: 0 16px;"><a href="${curAccessPoint ? curAccessPoint.url + window.location.href : ''}" target="_blank" id="fatcat_video_vip_link"><b id="fatcat_video_vip_popover_title">当前解析点 <span class="fatcat_video_vip_link">➜</span></b></a></p>
        <div style="display:flex;gap: 16px;">
            <select class="block-btn" id="fatcat_video_vip_select" style="background: #191a20eb;width:170px;text-align:left;">
                ${accessPoints.map(({ name, url }) => `<option value="${url}" ${name == curAccessPoint?.name ? 'selected' : ''}>${name}</option>`).join()}
            </select>
            <button class="block-btn" id="fatcat_video_vip_delpoint">删除</button>
            <button class="block-btn" id="fatcat_video_vip_resetpoints">重置</button>
        </div>
        <p style="margin-block: 20px 16px;"><b>自定义解析点</b></p>
        <div style="display:flex;gap: 16px;">
            <input id="fatcat_video_vip_point_name" placeholder="名称" autocomplete="off" style="border-radius: 8px 0 0 8px;"/>
            <input id="fatcat_video_vip_point_url" type="url" placeholder="URL" autocomplete="off" style="border-radius: 0 8px 8px 0;margin-left:-17px;width:140px;flex:1;"/>
            <button class="block-btn" id="fatcat_video_vip_addpoint">增加</button>
        </div>
        <button style="position:absolute; top:6px; right:10px; opacity: 0.5; cursor:pointer; padding:10px;" id="fatcat_video_vip_popover_close_btn">✕</button>
    </div>
</div>
        `;
        let popoverToggleBtn = wrapper.querySelector('#fatcat_video_vip_popover_toggle_btn');
        let popoverCloseBtn = wrapper.querySelector('#fatcat_video_vip_popover_close_btn');
        let popover = wrapper.querySelector('#fatcat_video_vip_popover');
        popoverToggleBtn.onclick = () => popover.toggleAttribute('hidden');
        popoverCloseBtn.onclick = () => popover.toggleAttribute('hidden', true);
        window.addEventListener('click', (e) => { if (!e.target.matches('#fatcat_video_vip_popover,#fatcat_video_vip_popover *,#fatcat_video_vip_popover_toggle_btn')) popover.toggleAttribute('hidden', true); })
        let popoverTitle = wrapper.querySelector('#fatcat_video_vip_popover_title');
        let nameInput = wrapper.querySelector('#fatcat_video_vip_point_name');
        let urlInput = wrapper.querySelector('#fatcat_video_vip_point_url');
        let addBtn = wrapper.querySelector('#fatcat_video_vip_addpoint');
        let delBtn = wrapper.querySelector('#fatcat_video_vip_delpoint');
        let setWrapperBtn = wrapper.querySelector('#fatcat_video_vip_setwrapper');
        let resetBtn = wrapper.querySelector('#fatcat_video_vip_resetpoints');
        let selects = wrapper.querySelector('#fatcat_video_vip_select');
        let aTag = wrapper.querySelector('#fatcat_video_vip_link');
        function updateSelectView(accessPoints, curAccessPoint) {
            selects.innerHTML = accessPoints.map(({ name, url }) => `<option value="${url}" ${name == curAccessPoint.name ? 'selected' : ''}>${name}</option>`).join();
        }
        async function applyAccessPoint(accessPoints, curAccessPoint) {
            await setUserConfig('accessPoints', accessPoints);
            await setUserConfig('curAccessPoint', curAccessPoint);
            updateSelectView(accessPoints, curAccessPoint);
            updateView(curAccessPoint);
            displayResult('✅ 完成');
            return;
        }
        let resultToasting;
        function displayResult(html) {
            let rawTitle = '当前解析点 <span class="fatcat_video_vip_link">➜</span>';
            popoverTitle.innerHTML = html;
            clearTimeout(resultToasting);
            resultToasting = setTimeout(() => popoverTitle.innerHTML = rawTitle, 1500);
        }
        addBtn.onclick = async () => {
            if (!(nameInput.value.trim() && urlInput.value.trim())) {
                displayResult('❌ 请完整输入');
                return;
            }
            let accessPoints = await getUserConfig('accessPoints');
            let sameUrlPoint = accessPoints.find(({ url }) => url == urlInput.value.trim());
            if (sameUrlPoint) {
                nameInput.value = sameUrlPoint.name;
                displayResult('❌ 重复数据');
                return;
            }
            let newPoint = { name: nameInput.value.trim(), url: urlInput.value.trim() };
            let newAccessPoints = accessPoints.concat([newPoint]);
            applyAccessPoint(newAccessPoints, newPoint);
        }
        delBtn.onclick = async () => {
            let accessPoints = await getUserConfig('accessPoints');
            let curAccessPoint = await getUserConfig('curAccessPoint');
            if (accessPoints.length == 0) {
                displayResult('❌ 数据已被清空');
                return;
            }
            nameInput.value = curAccessPoint.name;
            urlInput.value = curAccessPoint.url;
            let curAccessPointIndex = accessPoints.findIndex(point => point.name == curAccessPoint.name);
            let newAccessPoints = accessPoints.filter(point => point.name != curAccessPoint.name);
            curAccessPoint = newAccessPoints[Math.min(curAccessPointIndex, newAccessPoints.length - 1)];
            applyAccessPoint(newAccessPoints, curAccessPoint);
        }
        resetBtn.onclick = async () => {
            applyAccessPoint(ACCESS_POINT, ACCESS_POINT[0]);
        }
        function setWrapper(e) {
            if (e.target.matches('#fatcat_video_vip,#fatcat_video_vip *')) return;
            e.target.classList.toggle('fatcat_video_vip_custom_wrapper', true);
            window.removeEventListener('mousedown', setWrapper);
            document.querySelector('#fatcat_video_vip_select_area_css').remove();
            e.stopPropagation();
            e.preventDefault();
        }
        setWrapperBtn.addEventListener('click', () => {
            try {
                document.querySelector('#fatcat_video_vip_select_area_css').remove();
                document.querySelectorAll('.fatcat_video_vip_custom_wrapper').forEach(element => {
                    element.classList.toggle('fatcat_video_vip_custom_wrapper', false);
                });
            } catch (e) { }
            searchSelector = ['.fatcat_video_vip_custom_wrapper'];
            let selectAreaCss = document.createElement('style');
            selectAreaCss.id = 'fatcat_video_vip_select_area_css';
            selectAreaCss.innerHTML = `
                *:hover{outline: 2px solid #13bf92!important;outline-offset: -2px!important;box-shadow: inset 0 0 20px 7px #13bf9db3;z-index: 99999999;}
                *:has(*:hover){outline: unset!important;box-shadow: unset!important;}
                :is(#fatcat_video_vip,#fatcat_video_vip *):hover{outline:unset!important;box-shadow: unset!important;}`;
            document.body.append(selectAreaCss);
            setWrapperBtn.innerHTML = '请点击需要插入视频的区域';
            setTimeout(() => setWrapperBtn.innerHTML = '若未生效，可能区域过小📍点击重选', 3000);
            window.addEventListener('mousedown', setWrapper);
        })
        async function updateView(curAccessPoint) {
            let iframe = document.querySelector('#fatcat_video_vip_iframe');
            if (!iframe) return true;

            // 处理JSON格式的解析接口
            const jsonApis = ["火花解析", "熊二解析"]; 
            
            if (jsonApis.includes(curAccessPoint.name)) {
                try {
                    // 获取JSON响应
                    const response = await fetch(curAccessPoint.url + window.location.href);
                    const data = await response.json();
                    
                    // 检查返回状态和URL
                    if (data.code === "200" && data.url) {
                        // 使用播放器播放解析到的地址
                        const playerUrl = "https://www.playm3u8.cn/player.html?url=" + encodeURIComponent(data.url);
                        if (iframe.src !== playerUrl) {
                            iframe.src = playerUrl;
                            return true;
                        }
                    }
                } catch (error) {
                    console.error(`${curAccessPoint.name}解析失败:`, error);
                    // 解析失败时使用备用解析接口
                    const backupUrl = "https://jx.xmflv.com/?url=" + window.location.href;
                    if (iframe.src !== backupUrl) {
                        iframe.src = backupUrl;
                        return true;
                    }
                }
            } else {
                // 非JSON接口使用原来的方式
                let src = curAccessPoint ? curAccessPoint.url + window.location.href : '';
                if (iframe.src !== src) {
                    iframe.src = src;
                    return true;
                }
            }
        }
        window.addEventListener('mousedown', async (e) => {
            if (!(e.target.matches("#fatcat_video_vip *") || e.target.matches("#fatcat_video_vip_iframe"))) {
                let curAccessPoint = await getUserConfig('curAccessPoint');
                useInterval(async () => await updateView(curAccessPoint), 100, 10000);
            }
        });
        selects.onchange = async () => {
            let accessPoints = await getUserConfig('accessPoints');
            let curAccessPoint = accessPoints.find(({ url }) => url == selects.value);
            await setUserConfig('curAccessPoint', curAccessPoint);
            await updateView(curAccessPoint);
        };
        document.body.appendChild(wrapper);
    }
    function checkUrlValid(url) {
        return !(/http(s?):\/\/.*http(s?):\/\/.*/.test(url) || /^http(s?):\/\/[^\/]*\/$/.test(url));
    }
    async function waitForPageLoad() {
        return new Promise(resolve => { if (document.readyState == 'complete') resolve(); else document.addEventListener('DOMContentLoaded', resolve); });
    }
    function stopVideo() { document.querySelectorAll('video').forEach(video => { video.onpause = null; video.play = () => { }; video.pause(); video.muted = true; }) }
    async function inject() {
        if (!checkUrlValid(window.location.href)) return;
        patches[window.location.host] && patches[window.location.host]();
        await waitForPageLoad();
        let accessPoints = await getUserConfig('accessPoints');
        if (!accessPoints) {
            await setUserConfig('accessPoints', ACCESS_POINT);
            await setUserConfig('curAccessPoint', ACCESS_POINT[0]);
            accessPoints = ACCESS_POINT;
        }
        let curAccessPoint = await getUserConfig('curAccessPoint');
        createMenu(accessPoints, curAccessPoint);
        let videoWrapper = await findVideoWrapper();
        try {
            stopVideo(); useInterval(stopVideo, 2000, Infinity);
            document.querySelector('#fatcat_video_vip_setwrapper').style.display = 'none';
        } catch (e) { }
        createVideoFrame(videoWrapper, curAccessPoint);
    }
    inject();
})();
