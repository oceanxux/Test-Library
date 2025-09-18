// ==UserScript==
// @name         vip视频解析 
// @namespace    ocean
// @version      1
// ==/UserScript==
(function() {
    'use strict';
    var inTabMark=GM_getValue("inTabMark");
    var episodes=GM_getValue("episodes");
    //是否为解析页面,如果不是解析页，返回false，如果是解析页，返回true
    var isParsePage=location.hostname.search(/iqiyi|youku|wasu|le|v\.qq|tudou|mgtv|sohu|acfun|bilibili|1905|pptv|yinyuetai|fun\.tv/i) == -1;
    if(!isParsePage){GM_setValue("parseHref",location.href);}//如果不是解析页面，先更新解析目标链接
    var onclickString=' onclick=\"var a=document.querySelector(\'.menuWindow\'); window.open(this.dataset.url+((a.dataset.parse==\'true\')?a.dataset.href:location.href),a.dataset.checked)\" ';
    GM_addStyle(
        //噗噗解析页面对本CSS冲突
        '#menuHolder *{margin:0px; padding:0px;}'+
        '#menuHolder {width:30px; height:30px; position:fixed; top:0px; left:0px; z-index:999999; }'+
        '#menuHolder ul {padding:0; margin:0; list-style:none; position:absolute; left:0; top:0; width:0; height:0; }'+
        '#menuHolder ul li a {color:#000; text-decoration:none; font:bold 16px arial, sans-serif; text-align:center; -webkit-transform-origin:0 0; -moz-transform-origin:0 0; -ms-transform-origin:0 0; -o-transform-origin:0 0; transform-origin:0 0; }'+
        '#menuHolder ul.p1 li {position:absolute; left:0; top:0; }'+
        '#menuHolder ul.p2 {z-index:-1;}'+
        '#menuHolder ul.p3 {z-index:-1;}'+
        '#menuHolder li.s1 > a {position:absolute; display:block; width:30px; height:30px; background:#c8c8c8; border-radius:0 0 30px 0; opacity:0.3;}'+
        '#menuHolder li.s1 a > span {display:block; font-size:20px !important; -webkit-transform:rotate(45deg); -moz-transform:rotateZ(45deg); -ms-transform:rotate(45deg); -o-transform:rotate(45deg); transform:rotate(45deg);  }'+
        '#menuHolder li.s2 > a {position:absolute; display:block; width:100px; padding-left:70px; height:170px; background:rgba(220,220,220,0.5); border-radius:0 0 170px 0; }'+
        '#menuHolder ul.p3 li > a {position:absolute; display:block; width:100px; padding-left:180px; height:280px; background:rgba(148,148,148,0.6); border-radius:0 0 280px 0; }'+
        '#menuHolder ul ul { -webkit-transform-origin:0 0; -moz-transform-origin:0 0; -ms-transform-origin:0 0; -o-transform-origin:0 0; transform-origin:0 0; '+
        '-webkit-transform:rotate(90deg); -moz-transform:rotateZ(90deg); -ms-transform:rotate(90deg); -o-transform:rotate(90deg); transform:rotate(90deg); }'+
        '#menuHolder li.s2:nth-of-type(6) > a {-webkit-transform:rotate(75deg); -moz-transform:rotateZ(75deg); -ms-transform:rotate(75deg); -o-transform:rotate(75deg); transform:rotate(75deg); }'+
        '#menuHolder li.s2:nth-of-type(5) > a {-webkit-transform:rotate(60deg); -moz-transform:rotateZ(60deg); -ms-transform:rotate(60deg); -o-transform:rotate(60deg); transform:rotate(60deg); }'+
        '#menuHolder li.s2:nth-of-type(4) > a {-webkit-transform:rotate(45deg); -moz-transform:rotateZ(45deg); -ms-transform:rotate(45deg); -o-transform:rotate(45deg); transform:rotate(45deg); }'+
        '#menuHolder li.s2:nth-of-type(3) > a {-webkit-transform:rotate(30deg); -moz-transform:rotateZ(30deg); -ms-transform:rotate(30deg); -o-transform:rotate(30deg); transform:rotate(30deg); }'+
        '#menuHolder li.s2:nth-of-type(2) > a {-webkit-transform:rotate(15deg); -moz-transform:rotateZ(15deg); -ms-transform:rotate(15deg); -o-transform:rotate(15deg); transform:rotate(15deg); }'+
        //'#menuHolder .a6 li:nth-of-type(6) > a {background:#444; -webkit-transform:rotate(75deg); -moz-transform:rotateZ(75deg); -ms-transform:rotate(75deg); -o-transform:rotate(75deg); transform:rotate(75deg); }'+
        //'#menuHolder .a6 li:nth-of-type(5) > a {background:#555; -webkit-transform:rotate(60deg); -moz-transform:rotateZ(60deg); -ms-transform:rotate(60deg); -o-transform:rotate(60deg); transform:rotate(60deg); }'+
        //'#menuHolder .a6 li:nth-of-type(4) > a {background:#666; -webkit-transform:rotate(45deg); -moz-transform:rotateZ(45deg); -ms-transform:rotate(45deg); -o-transform:rotate(45deg); transform:rotate(45deg); }'+
        //'#menuHolder .a6 li:nth-of-type(3) > a {background:#777; -webkit-transform:rotate(30deg); -moz-transform:rotateZ(30deg); -ms-transform:rotate(30deg); -o-transform:rotate(30deg); transform:rotate(30deg); }'+
        //'#menuHolder .a6 li:nth-of-type(2) > a {background:#888; -webkit-transform:rotate(15deg); -moz-transform:rotateZ(15deg); -ms-transform:rotate(15deg); -o-transform:rotate(15deg); transform:rotate(15deg); }'+
        '#menuHolder .a5 li:nth-of-type(5) > a {-webkit-transform:rotate(72deg); -moz-transform:rotateZ(72deg); -ms-transform:rotate(72deg); -o-transform:rotate(72deg); transform:rotate(72deg); }'+
        '#menuHolder .a5 li:nth-of-type(4) > a {-webkit-transform:rotate(54deg); -moz-transform:rotateZ(54deg); -ms-transform:rotate(54deg); -o-transform:rotate(54deg); transform:rotate(54deg); }'+
        '#menuHolder .a5 li:nth-of-type(3) > a {-webkit-transform:rotate(36deg); -moz-transform:rotateZ(36deg); -ms-transform:rotate(36deg); -o-transform:rotate(36deg); transform:rotate(36deg); }'+
        '#menuHolder .a5 li:nth-of-type(2) > a {-webkit-transform:rotate(18deg); -moz-transform:rotateZ(18deg); -ms-transform:rotate(18deg); -o-transform:rotate(18deg); transform:rotate(18deg); }'+
        //'#menuHolder .a3 li:nth-of-type(3) > a {background:#777; -webkit-transform:rotate(60deg); -moz-transform:rotateZ(60deg); -ms-transform:rotate(60deg); -o-transform:rotate(60deg); transform:rotate(60deg); }'+
        //'#menuHolder .a3 li:nth-of-type(2) > a {background:#888; -webkit-transform:rotate(30deg); -moz-transform:rotateZ(30deg); -ms-transform:rotate(30deg); -o-transform:rotate(30deg); transform:rotate(30deg); }'+
        '#menuHolder .a2 li:nth-of-type(2) > a {-webkit-transform:rotate(45deg); -moz-transform:rotateZ(45deg); -ms-transform:rotate(45deg); -o-transform:rotate(45deg); transform:rotate(45deg); }'+
        '#menuHolder li.s1:hover ul.p2 { -webkit-transform:rotate(0deg); -moz-transform:rotateZ(0deg); -ms-transform:rotate(0deg); -o-transform:rotate(0deg); transform:rotate(0deg); }'+
        '#menuHolder li.s2:hover ul.p3 { -webkit-transform:rotate(0deg); -moz-transform:rotateZ(0deg); -ms-transform:rotate(0deg); -o-transform:rotate(0deg); transform:rotate(0deg); }'+
        '#menuHolder a:hover {background:#81bc06 !important; color:#fff; }'+
        '.menuWindow {width:30px; height:30px; overflow:hidden; position:absolute; left:0; top:0; text-align:center; font-size:18px; z-index:999999;}'+
        '.menuWindow:hover li.s1 a {opacity:1!important;}'+
        '#menuHolder:hover .menuWindow:hover {width:281px; height:281px;}'
    );
    //为了精简，最多保留11接口
    var apis=[
    {"name":"水星","url":"http://json.xingkf.cn/api/?key=5jBsAar4Ju3dKvcNU3&url=","title":"奇艺720直解不限速，别外传，别截图,"},
    {"name":"追忆","url":"http://115.231.220.36:8801/jx/tvbox/2.php?url=","title":"追忆抓的,腾讯直解APP不限速,别截图,奇艺720直解，如果一次不行，按 . 快捷键二次解析即可"},
    {"name":"壁纸","url":"http://124.71.8.170:3389/json.php?url=|http://124.71.8.170:3389/json.php?cat_ext=cGFyc2Vz&url=","title":"B站720直解,沐沐抓的,其他平台对接初恋"},
    {"name":"八号","url":"https://api.52wyb.com/index/?url=","title":"防盗接口，需要 猫HD 修改来源,见大群群文件"},
    {"name":"鱼家","url":"http://json.84jia.com/home/api?type=ys&uid=8096440&key=cepwyzACGJPQSTVX04&url=|http://json.84jia.com/home/api?type=ys&uid=162970&key=bghjkmnrszEGIMNRW4&url=|http://jx.meowtv.cn/?url=","title":"uid=162970大佬买的"},
    {"name":"爱酷","url":"https://cache.json.icu/8520.php?url=|https://api.json.icu/api/?key=ca874f2179e68cc78b6f0d1c8addb58e&url=|https://douban.armytea.com/json.php?url=|https://api.json.icu/api/?key=811820edf0b6414f05a648bc0e0ba1e5&url=|https://api.json.icu/api/?key=cebaa8d3da1540559d397891ec522e0e&url=","title":"key=811820edf0b6414f05a648bc0e0ba1e5大佬买的,key=cebaa8d3da1540559d397891ec522e0e飞云的爱酷无限点"},
    {"name":"左岸","url":"http://110.42.2.247:880/analysis/json/?uid=2334&my=fhloqstzDIKLMORTZ9&url=|http://116.196.99.168/akys.php/?url=|http://106.14.14.200:8956/jx.php?url=","title":""},
    {"name":"阳途","url":"http://open.yangtuyun.cn/open/jx_api/170?key=tfgrHWsqlU&url=","title":""},
    {"name":"初恋","url":"https://json.oorl.cn/api/?key=RLdYwbPtVKxum234dg&url=|https://json.oorl.cn/api/?key=OafVOwHB6Hd0x9WZhK&url=|http://jxxcc-cc.dianshia.top:8821/api/?key=UAOfSBFIaFI3IvLi8r&url=|http://jxxcc-cc.dianshia.top:8821/api/?key=UAOfSBFIaFI3IvLi8r&url=|https://vip.liuliyun.vip:8686//api/?key=9CMB6wpsuGf5J9Ovsf&url=|http://124.221.100.97:3031/api/?key=W0JuOBDrhRmfcN8exW&url=|http://106.53.99.43:92/api/?key=a6e816db773781601df448e9c5d11166&url=","title":"最后一个熊大，曾经腾讯4k直解"},
    {"name":"茶语","url":"http://authi.cnlav.cn/home/api?type=ys&uid=335819&key=fjnotCDEGJKLPRV458&url=|http://authi.cnlav.cn/home/api?type=ys&uid=3159853&key=bhopuvwxzHLPRUWY89&url=|http://authi.cnlav.cn/home/api?type=ys&uid=6712384&key=cjtvACEGILMRVWY678&url=","title":""},
    {"name":"晓城","url":"https://svip.cygc.xyz/api/?key=a92A1mlWR57tSlxCjW&url=|https://bfq.cddys.me/nimasile2/API.php?url=","title":""},
    {"name":"茶茶","url":"http://htp.behds.cn/json/520239app10/jsonff185.php?url=","title":""},
    {"name":"久云","url":"http://jx.jjtv.bf/json/99.php?url=|http://119.91.123.253:2345/Api/yun.php?url={ua:okhttp/3.12.0}","title":"貌似对接人人迷"},
    {"name":"295","url":"https://295jx.295yun.vip:295/api/?key=6QyRWRQpNLJePE55s1&url=","title":""},
    {"name":"花花","url":"http://vip.hhtv.vip:38801/ytjx.php?key=1234abcd&url=","title":"别外传，别截图"},
    {"name":"觅影","url":"http://39.104.230.177:1111/api/?key=wD2olCBAAP0ZIZXL7n&url=","title":""},
    {"name":"君离","url":"http://api.jlgw.top/api/diy/?key=vvtwOacOTswJ4P3j36&url=|http://jx.xn--sqro98f.icu/api/diy/?key=vvtwOacOTswJ4P3j36&url=","title":""},
    {"name":"乱对","url":"http://vip.2068tv.com//api//?key=oPp1j0ZBsSV7r9cFlG&url=|http://122.228.84.103:7777/api/?key=ewHDw89rbnX76D75ff&url=|http://122.228.84.103:7777/api/?key=lEoJRrX01Drg8Of5aA&url=|http://122.228.84.103:7777/api/?key=TJ5aojxggobuP4CTTw&url=|https://api.huohua.vip/api/?key=wrN9IgE4KZLZRTDUwV&url=|https://api.huohua.vip/api/?key=Y5mrHE7CaQRzUOVKZc&url=|https://svip.kumyun.cn:1213/home/api?type=ys&cc=mp4&uid=3537010&key=abjkmrvCDEGKOPWZ56&url=|http://cl.ruifeng.lol/api/?key=G7ONc3o0i2P1eyM96P&url=|http://cl.ruifeng.lol/api/?key=bRMYcfNy5tQnLEhlxY&url=","title":""},
    {"name":"清风","url":"http://xiutan.shiyifacai.com/json/qingfeng.php?url=","title":""},
    {"name":"迷你","url":"https://json.mnvia.xyz/api/?key=KMqx4Gm4B666f3zQgb&url=","title":""},
    {"name":"三路","url":"http://jx.xn--od1aq39b.net:8899/api/?key=wm5nLOMqcgT4Xy6nua&url=","title":""},
    {"name":"鱼仔","url":"http://116.196.99.168/ql.php/?v=|http://116.196.99.168/369.php?v=|http://116.196.99.168/%E7%88%B1%E9%85%B7.php?url=|http://116.196.99.168/12.php?v=","title":""},
    {"name":"涂成","url":"https://110.42.2.98:22222/api/?key=NQk7InG1Kn7SaXOVY2&url=|https://110.42.2.98:22222/api/?key=QxR68LYoItCdbTOVgM&url=|http://42.157.129.144:2323/CH/caihong_1993138546.php?url=","title":""},
    {"name":"晨光","url":"https://www.cgdyw.net/jiexi/jiekou-1/api.php{json:2}|https://www.cgdyw.net/jiexi/jiekou-2/api.php{json:2}|https://www.cgdyw.net/jiexi/jiekou-3/api.php{json:2}|https://www.cgdyw.net/jiexi/jiekou-4/api.php{json:2}","title":""},
    {"name":"东明","url":"http://110.40.147.212/analysis.php?v=","title":"对接初恋云,提取播放数据，当成假Json"},
    {"name":"麒麟","url":"https://t1.qlplayer.cyou/player/analysis.php?v=","title":"提取播放数据，当成假Json"},
    {"name":"一溜","url":"http://111.180.191.20:1616/player/analysis.php?v=","title":"提取播放数据，当成假Json"},
    {"name":"虾米","url":"http://116.196.99.168/77.php/?v=|http://appto.tvhh.eu.org:91/jx/xmflv/?v=","title":"虾米转json,不要频繁请求,一分钟十次"},
    {"name":"百度","url":"https://ysxjjkl.souyisou.top/?search=%s","title":"百度搜索，失效较多"},
    {"name":"阿里","url":"https://www.alipansou.com/search?k=%s&s=0&t=-1","title":"阿里搜索"},
    {"name":"量子","url":"http://cj.lziapi.com/api.php/provide/vod/from/lzm3u8","title":""},
    ];
    function parseInTab(){
        inTabMark=document.querySelector("#inTabChekbx").checked;
        GM_setValue("inTabMark",inTabMark);
        document.querySelector('.menuWindow').dataset.checked=(inTabMark?'_self':'_blank');
    }
    //function updateHref(){GM_setValue("parseHref",location.href);}
    function rightEpsLinkCheck() {
        episodes=document.querySelector("#realLinkChekbx").checked;
        GM_setValue("episodes",episodes);
        if(episodes && document.querySelector('#widget-dramaseries')){
            document.querySelector('#widget-dramaseries').addEventListener('click', function getLink (e){      //-------------iqiyi剧集真实播放页面方法  Begin------------------//Homepage: http://hoothin.com    Email: rixixi@gmail.com
                var target=e.target.parentNode.tagName=="LI"?e.target.parentNode:(e.target.parentNode.parentNode.tagName=="LI"?e.target.parentNode.parentNode:e.target.parentNode.parentNode.parentNode);
                if(target.tagName!="LI")return;
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: "http://cache.video.qiyi.com/jp/vi/"+target.dataset.videolistTvid+"/"+target.dataset.videolistVid+"/?callback=crackIqiyi",
                    onload: function(result) {
                        var crackIqiyi=function(d){
                            location.href=d.vu;
                        };
                        eval(result.responseText);
                    }
                });
            });                                                                             //-------------iqiyi剧集真实播放页面方法  End------------------
        }
        else if(document.querySelector('#widget-dramaseries')){document.querySelector('#widget-dramaseries').removeEventListener('click', getLink);}
    }

    var elemtxt=
        '<div class="menuWindow" data-href="'+GM_getValue("parseHref")+'" data-parse="'+isParsePage+'" data-checked="'+((inTabMark || isParsePage) ? '_self' : '_blank')+'">'+
        '<ul class="p1">'+
        '<li class="s1"><a data-mark="go" data-url="'+apis[0].url+'" title="'+apis[0].title+'"'+onclickString+'><span>▶</span></a>'+
        '<ul class="p2">'+
        '<li class="s2"><a  data-mark="go" data-url="'+apis[1].url+'" title="'+apis[1].title+'"'+onclickString+'>'+apis[1].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[10].url+'" title="'+apis[10].title+'"'+onclickString+'>'+apis[10].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2"><a data-mark="go" data-url="'+apis[2].url+'" title="'+apis[2].title+'"'+onclickString+'>'+apis[2].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[10].url+'" title="'+apis[10].title+'"'+onclickString+'>'+apis[10].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2"><a data-mark="go" data-url="'+apis[3].url+'" title="'+apis[3].title+'"'+onclickString+'>'+apis[3].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[10].url+'" title="'+apis[10].title+'"'+onclickString+'>'+apis[10].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2"><a data-mark="go" data-url="'+apis[4].url+'" title="'+apis[4].title+'"'+onclickString+'>'+apis[4].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[10].url+'" title="'+apis[10].title+'"'+onclickString+'>'+apis[10].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2 b6"><a data-mark="go" data-url="'+apis[5].url+'" title="'+apis[5].title+'"'+onclickString+'>'+apis[5].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[10].url+'" title="'+apis[10].title+'"'+onclickString+'>'+apis[10].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2"><a>设置</a>'+
        '<ul class="p3 a2">'+
        '<li><a><label><input type="checkbox" id="inTabChekbx">本页解析</label></a></li>'+
        '<li><a><label><input type="checkbox" id="realLinkChekbx">爱奇艺正确选集</label></a></li>'+
        '</ul>'+
        '</li>'+
        '</ul>'+
        '</li>'+
        '</ul>'+
        '</div>';
    var div=document.createElement("div");
    div.id="menuHolder";
    div.innerHTML=elemtxt;
    document.body.appendChild(div);
    document.querySelector("#inTabChekbx").addEventListener("click",parseInTab,false);
    document.querySelector("#inTabChekbx").checked=inTabMark;
    document.querySelector("#realLinkChekbx").addEventListener("click",rightEpsLinkCheck,false);
    document.querySelector("#realLinkChekbx").checked=episodes;
    if(episodes && window.location.hostname.indexOf("iqiyi")!=-1){
        rightEpsLinkCheck();
    }
    function checkCSS(){
        var as,bs,i,j;
        as=document.querySelectorAll('#menuHolder ul.p3 li > a');
        bs=document.querySelectorAll('#menuHolder li.s2 > a');
        if(window.location.hostname.indexOf("ifkjx")!=-1 ) {
            for(i=0;i<bs.length;i++){bs[i].style.width="170px";}
            for(j=0;j<as.length;j++){as[j].style.width="280px";}
        }
        if(window.location.hostname.indexOf("flvsp")!=-1) {
            for(i=0;i<bs.length;i++){bs[i].style.maxHeight="170px";}
            for(j=0;j<as.length;j++){as[j].style.maxHeight="280px";}
        }
    }
    checkCSS();//修正个别网站CSS

})();
