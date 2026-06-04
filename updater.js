// updater.js
'use strict';

const UpdateModule = (() => {
  // 🌟 每次更新时，只需要修改这个版本号和下面的更新内容即可！
  const CURRENT_VERSION = 'v2.5.0'; 
  const VERSION_KEY = 'chillos-last-version';

  const CHANGELOG = [
  "✦ 群像【状态面板】大升级 · 完全自定义：现在卡片的样式和数据字段都能自己定。① 字段：自己加要哪些数据（体力、好感、心情、武器……），配一句给 AI 的说明，系统自动让 AI 按格式填；② 模板：HTML / CSS / JS 全放开，在沙箱里跑，点击翻面、打字机、折叠面板都行；③ 实时预览。占位符支持 {{字段名}} 和编号 $1 $2 两种写法，进度条用 {{key.bar}} 一行搞定。在外面搓好的状态栏整段贴进来，点【从模板生成字段】自动建好字段表，不用手动加。还内置【一键套用报纸风】当现成例子。角色切换可用系统默认圆点，也可在模板里用 window.GS_CHARS 自己写横排 / 分段切换。",
  "✦ 群像【状态面板】新增【我的预设】：把调好的字段表 + 模板存成预设，跨群像共用，下次任何群像点一下就套用，不用每次手动搭。支持命名、覆盖、删除，预设也会跟着备份包一起导出。",
  "✦ 群像【教程】已同步更新：索引里的群像指南补全了状态面板的全新玩法（自定义字段、贴模板一键生成、自定义切换），并新增【模型切换】【网易云配乐】两条教程，遇到不会的随时翻。",
  "✦ 群像新增【网易云配乐】：在 + 菜单里填好自己的网易云 API 和 cookie 并开启，AI 就会随剧情情绪自动点歌（获取 cookie 的步骤在面板里有说明）。注意：开配乐时记得开🪄，否则抓不到歌。",
  "✦ 群像新增【模型切换】：+ 菜单里可单独给群像换 API 和模型，只在群像内生效、不影响设置页——聊天和总结能用不同模型。",
  "✦ 配乐播放条做成了票根风，带封面、播放波形，点一下即可播放。",
  "✦ 修复：悬浮球预设过多可滚动切换，收回 API 面板不再乱跳。",
  "✦ 修复：清空记录时会一并清除历史心声。"
];

  // 动态注入弹窗的 CSS 样式
  function injectCSS() {
    if (document.getElementById('updater-css')) return;
    const style = document.createElement('style');
    style.id = 'updater-css';
    style.textContent = `
      .upd-overlay {
        position: absolute; inset: 0; z-index: 9999;
        background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
      }
      .upd-overlay.active { opacity: 1; pointer-events: auto; }
      .upd-card {
        background: var(--bg-card, #fff); border: 1px solid var(--border-line, #e0e0e0);
        border-radius: 24px; padding: 32px 24px; width: 85%; max-width: 320px;
        box-shadow: 0 40px 80px rgba(0,0,0,0.15); position: relative; overflow: hidden;
        transform: translateY(20px) scale(0.95); transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      }
      .upd-overlay.active .upd-card { transform: translateY(0) scale(1); }
      .upd-watermark {
        position: absolute; top: -30px; right: -20px; font-family: 'Playfair Display', serif;
        font-size: 160px; font-style: italic; font-weight: 300; color: var(--text-main, #121212);
        opacity: 0.03; line-height: 1; pointer-events: none; z-index: 0;
      }
      .upd-header { margin-bottom: 24px; position: relative; z-index: 1; }
      .upd-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 600; font-style: italic; color: var(--text-main, #121212); line-height: 1; }
      .upd-version { font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--text-sub, #888); letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; font-weight: 700; }
      .upd-list { position: relative; z-index: 1; max-height: 40vh; overflow-y: auto; margin-bottom: 32px; padding-right: 4px; }
      .upd-list::-webkit-scrollbar { display: none; }
      .upd-item { font-family: 'Noto Sans SC', sans-serif; font-size: 0.85rem; color: var(--text-main, #333); line-height: 1.6; margin-bottom: 12px; }
      .upd-btn {
        width: 100%; padding: 14px 0; background: var(--text-main, #121212); color: var(--bg-device, #fff);
        border: none; border-radius: 100px; font-family: 'Space Mono', monospace; font-size: 0.8rem;
        font-weight: 600; letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
        position: relative; z-index: 1; transition: transform 0.2s; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }
      .upd-btn:active { transform: scale(0.96); }
    `;
    document.head.appendChild(style);
  }

  // 动态创建并插入 DOM
  function createModal() {
    if (document.getElementById('updater-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'updater-overlay';
    overlay.className = 'upd-overlay';
    
    let listHtml = CHANGELOG.map(item => `<div class="upd-item">${item}</div>`).join('');

    overlay.innerHTML = `
      <div class="upd-card">
        <div class="upd-watermark">U</div>
        <div class="upd-header">
          <div class="upd-title">System Update</div>
          <div class="upd-version">VERSION // ${CURRENT_VERSION}</div>
        </div>
        <div class="upd-list">${listHtml}</div>
        <button class="upd-btn" onclick="UpdateModule.closeAndSave()">Got it</button>
      </div>
    `;
    // 挂载到 body 或者 device 容器内
    const device = document.querySelector('.device') || document.body;
    device.appendChild(overlay);
  }

  function checkUpdate() {
    // 使用 localStorage 进行简单的本地版本校验
    const savedVersion = localStorage.getItem(VERSION_KEY);
    
    // 如果没有记录（新用户）或者版本号变了（老用户更新了），则弹出
    if (savedVersion !== CURRENT_VERSION) {
      injectCSS();
      createModal();
      // 稍微延迟一下，配合系统的进入动画，显得更丝滑
      setTimeout(() => {
        const overlay = document.getElementById('updater-overlay');
        if (overlay) overlay.classList.add('active');
      }, 800);
    }
  }

  function closeAndSave() {
    const overlay = document.getElementById('updater-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      // 记录最新版本号，下次就不弹了
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      // 等待动画结束后移除 DOM
      setTimeout(() => overlay.remove(), 400);
    }
  }

  return { checkUpdate, closeAndSave };
})();