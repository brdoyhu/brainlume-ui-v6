const catalogue=[
['today','今日与场景',[
['home','01','场景首页'],['home','01A','清醒感回应','awake'],['plan','02F','疲劳 · 测量＋光照','','fatigue'],['plan','02F1','疲劳 · 仅测量','only','fatigue'],['plan','02B','日常脑状态监测','only','daily'],['restplan','02R','休息光照'],['best','12','较佳表现 · 测量＋光照','','best'],['best','12O','较佳表现 · 仅测量','only','best'],['feedback','13','休息建议'],['feedback','13A','休息进行中','resting'],['feedback','13D','跳过建议','dismissed'],['feedback','13F','休息完成','finished']]],
['check','检测与结果',[
['wear','03','佩戴检查'],['wear','03Q','接触不良','contact'],['wear','03S','今日睡眠已记录','sleep-recorded'],['measure','04','睁眼①'],['measure','04C1','闭眼①','closed1'],['measure','04C2','闭眼②','closed2'],['measure','04O2','睁眼②','open2'],['measure','04P','检测暂停','paused'],['measure','04A','After 测量','','fatigue','after'],['self','05','主观自评'],['task','06','认知评估 · 延期'],['result','07T','自报疲劳 · 休息建议','tired'],['result','07A','状态需留意 · 休息建议','attention','daily'],['result','07F','疲劳记录','','fatigue'],['result','07B','日常脑电结果','','daily'],['result','07P','较佳表现 · 脑电结果','only','best'],['result','07N','未填写自评','missing'],['result','07X','证据冲突','conflict'],['result','07Q','质量不足','contact'],['result','07R','已有参考','reference'],['result','07EC','闭眼分布','eyes-closed'],['features','08','特征与质量'],['features','08EC','闭眼脑波分布','eyes-closed'],['features','08Q','脑波质量不足','contact'],['features','08F','拟合失败','fit-failed']]],
['light','光照与完成',[
['light','09F','疲劳光照 · 12 分钟','','fatigue'],['light','09C','较佳表现 · 光照 8 分钟','','best'],['light','09R','只照不测 · 20 分钟','rest'],['light','09P','光照暂停','paused'],['complete','10F','前后自评记录'],['complete','10C','较佳表现 · 前后脑电','','best'],['complete','10R','休息光照记录','rest'],['complete','10R1','休息光照 · 提前结束','rest-early']]],
['history','趋势与标定',[
['trends','11','个人趋势'],['trends','11E','趋势空状态','empty'],['history','11H','单次记录'],['history','11R','光照记录','rest'],['history','11X','不可比记录','excluded'],['calibration','14','初测进度'],['calibration','14D','完成待评审','done'],['calibration','14U','尚不能确定','uncertain'],['calibration','14I','数据不足','insufficient'],['calibration','14N','无明显响应','none'],['learn','19','Get to know'],['science','18L','脑电科普'],['empty','18','首次空状态']]],
['exceptions','中断与安全',[
['invalid','15B','蓝牙中断','offline'],['invalid','15C','接触中断','contact'],['held','15L','光照中断 · 规则待定'],['safety','16T','温度上限停止','safety-temperature'],['safety','16E','累计能量停止','safety-energy'],['safety','16I','驱动限流停止','safety-current'],['partial','16S','主动安全结束']]],
['account','设备与账户',[
['device','17','设备与设置'],['device','17O','设备离线','offline'],['appearance','17A','外观 · 三种模式'],['privacy','17P','数据与研究选择'],['account','A1','账户'],['profile','A2','个人信息'],['hearing','A3','听觉协议说明'],['splash','00','开屏'],['welcome','00b','欢迎'],['email','00c','邮箱'],['password','00c1','密码'],['verify','00d','验证邮箱'],['forgot','00c2','找回密码'],['sent','00c3','重置邮件'],['first','00e','首次使用'],['terms','00T','隐私与条款']]]];
const mode=document.body.dataset.mode||'pages',total=catalogue.reduce((n,g)=>n+g[2].length,0),all=catalogue.flatMap(g=>g[2]);
let selectedTheme=new URLSearchParams(location.search).get('theme')||'light';if(!['light','dark','system'].includes(selectedTheme))selectedTheme='light';
let galleryLang=new URLSearchParams(location.search).get('lang');if(!['zh','en'].includes(galleryLang))galleryLang='en';
let compareId=all.some(x=>x[1]===location.hash.slice(1))?location.hash.slice(1):'01';
let boardId=all.some(x=>x[1]===location.hash.slice(1))?location.hash.slice(1):'01';
let fitWindow=true;
const url=(item,theme)=>{const [screen,id,name,state,scene,extra]=item;const p=new URLSearchParams({screen,theme,lang:galleryLang,v:'20261119-priority2'});if(state==='only')p.set('mode','only');else if(state)p.set('state',state);if(scene)p.set('scene',scene);if(extra==='full')p.set('mode','full');if(extra==='after')p.set('phase','after');return'index.html?'+p;};
const card=(item,theme)=>`<article class="gallery-card" id="screen-${item[1]}${mode==='compare'?'-'+theme:''}"><div class="card-label"><h2><span>${item[1]}</span> ${item[2]}</h2><div class="card-actions">${mode==='board'?`<button type="button" data-preview-size aria-pressed="${!fitWindow}">${fitWindow?'原始尺寸':'适合窗口'}</button>`:''}<a href="${url(item,theme)}">打开 ↗</a></div></div><div class="screen-frame"><iframe loading="lazy" title="${item[2]} · ${theme}" src="${url(item,theme)}&embed=1"></iframe></div><p>${theme==='dark'?'深色':theme==='light'?'浅色':'跟随系统'} · 可滚动、可交互 · 设备与数据为模拟</p></article>`;
function fitPreview(){if(mode!=='board')return;const stage=document.querySelector('.gallery');let scale=1;if(fitWindow&&innerWidth>760)scale=Math.min(1,Math.max(.4,(stage.clientHeight-90)/844));else if(innerWidth<=760)scale=Math.min(1,(innerWidth-48)/390);document.documentElement.style.setProperty('--preview-scale',String(scale));}
function scheduleFit(){if(typeof requestAnimationFrame==='function')requestAnimationFrame(fitPreview);else fitPreview();}
function updateURL(hash=location.hash.slice(1)){const u=new URL(location.href);u.searchParams.set('lang',galleryLang);u.searchParams.set('theme',selectedTheme);u.hash=hash;history.replaceState(null,'',u.pathname+u.search+u.hash);}
function showBoard(id){const item=all.find(x=>x[1]===id)||all[0];boardId=item[1];const openLink=document.querySelector('.header-links a');if(openLink)openLink.href=url(item,selectedTheme);document.querySelector('.gallery').innerHTML=card(item,selectedTheme);document.querySelectorAll('[data-module]').forEach(b=>{const on=b.dataset.module===boardId;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));if(on)b.closest('details').open=true;});scheduleFit();}
function init(){
 document.querySelector('.language-select').innerHTML=`<span>页面语言</span>${[['zh','中文'],['en','English']].map(([v,t])=>`<button data-language="${v}" class="${galleryLang===v?'active':''}" aria-pressed="${galleryLang===v}">${t}</button>`).join('')}`;
 document.querySelector('header').innerHTML=`<div><span class="kicker">BRAINLUME / V7 / UE EDITION</span><h1>${mode==='compare'?'同一套 App，两种外观。':'Brainlume · UE 重构版'}</h1><p>V7 视觉延续 · 三组入口 · 四段三通道检测 · 浅色 / 深色 / 跟随系统</p></div><div class="header-links"><a href="${url(all.find(x=>x[1]===boardId)||all[0],selectedTheme)}">体验 App ↗</a><a href="${mode==='pages'?'board.html':'pages.html'}?lang=${galleryLang}&theme=${selectedTheme}">${mode==='pages'?'逐页预览':'全部 '+total+' 个状态'} ↗</a><a href="appearance.html?lang=${galleryLang}&theme=${selectedTheme}">主题对照 ↗</a></div>`;
 document.querySelector('.theme-select').innerHTML=[['light','浅色'],['dark','深色'],['system','跟随系统']].map(([v,t])=>`<button data-theme="${v}" aria-pressed="${selectedTheme===v}" class="${selectedTheme===v?'active':''}">${t}</button>`).join('');
 if(mode==='compare'){document.querySelector('.module-tabs').innerHTML=all.filter(x=>['home','welcome','plan','wear','measure','result','features','learn','trends','device','appearance'].includes(x[0])).filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i).map(x=>`<button data-compare="${x[1]}"><span class="page-number">${x[1]}</span><span>${x[2]}</span></button>`).join('');showCompare(compareId);return;}
 if(mode==='board'){document.querySelector('.module-tabs').innerHTML=catalogue.map(([id,title,items])=>`<details class="nav-group" ${items.some(x=>x[1]===boardId)?'open':''}><summary>${title}<span>${items.length}</span></summary><div>${items.map(x=>`<button data-module="${x[1]}"><span class="page-number">${x[1]}</span><span>${x[2]}</span></button>`).join('')}</div></details>`).join('');showBoard(boardId);return;}
 document.querySelector('.module-tabs').innerHTML=catalogue.map(([id,t,items])=>`<button data-group="${id}"><span>${t}</span><small>${items.length}</small></button>`).join('');showGroup(location.hash.slice(1)||'today');
}
function showGroup(id){const g=catalogue.find(g=>g[0]===id)||catalogue[0];document.querySelectorAll('[data-group]').forEach(b=>{b.classList.toggle('active',b.dataset.group===g[0]);b.setAttribute('aria-pressed',String(b.dataset.group===g[0]));});document.querySelector('.gallery').innerHTML=g[2].map(item=>card(item,selectedTheme)).join('');}
function showCompare(id){compareId=id;const item=all.find(x=>x[1]===id)||all[0];document.querySelector('.gallery').innerHTML=card(item,'light')+card(item,'dark');document.querySelectorAll('[data-compare]').forEach(b=>{b.classList.toggle('active',b.dataset.compare===id);b.setAttribute('aria-pressed',String(b.dataset.compare===id))});}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.language){galleryLang=b.dataset.language;try{localStorage.setItem('brainlume-v7-lang',galleryLang)}catch{}updateURL();init();return;}
 if(b.dataset.theme){selectedTheme=b.dataset.theme;updateURL();init();return;}
 if(b.dataset.group){updateURL(b.dataset.group);showGroup(b.dataset.group);}
 if(b.dataset.compare){updateURL(b.dataset.compare);showCompare(b.dataset.compare);}
 if(b.dataset.module){updateURL(b.dataset.module);showBoard(b.dataset.module);}
 if(b.hasAttribute('data-preview-size')){fitWindow=!fitWindow;b.textContent=fitWindow?'原始尺寸':'适合窗口';b.setAttribute('aria-pressed',String(!fitWindow));scheduleFit();}
});
init();
// Collapsing the sidebar never reconstructs the selected app iframe.
(()=>{
 const panel=document.querySelector('.gallery-controls');if(!panel)return;
 const toggle=document.createElement('button');toggle.className='gallery-collapse';toggle.type='button';toggle.setAttribute('aria-controls','gallery-navigation');
 const status=document.createElement('span');status.className='gallery-collapse-status';status.textContent='页面导航';panel.prepend(status,toggle);
 const content=document.createElement('div');content.id='gallery-navigation';content.className='gallery-navigation';
 for(const nav of [...panel.querySelectorAll(':scope > nav')])content.append(nav);panel.append(content);
 let collapsed=false;try{collapsed=localStorage.getItem('brainlume-v7-sidebar-collapsed')==='true'}catch{}
 function update(){document.body.classList.toggle('nav-collapsed',collapsed);panel.classList.toggle('is-collapsed',collapsed);content.hidden=collapsed;toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',collapsed?'展开导航':'收起导航');toggle.innerHTML=`${collapsed?'展开':'收起'}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${collapsed?'m7 5 5 5-5 5':'m12 5-5 5 5 5'}"/></svg>`;scheduleFit();}
 toggle.addEventListener('click',()=>{collapsed=!collapsed;try{localStorage.setItem('brainlume-v7-sidebar-collapsed',String(collapsed))}catch{}update();});update();
})();
window.addEventListener('resize',fitPreview);
