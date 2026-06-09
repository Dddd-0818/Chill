// updater.js
'use strict';

const UpdateModule = (() => {
  // 🌟 每次更新时，只需要修改这个版本号和下面的更新内容即可！
  const CURRENT_VERSION = 'v3.4.0'; 
  const VERSION_KEY = 'chillos-last-version';
  
  const CHANGELOG = [
  "✦ 群聊新功能【分身 / 冒充者】：群聊设置里新增「分身 / 冒充者」入口，可以往群里塞 AI 扮演的「假人」混在真人里，玩真假难辨的猜谜。新建分身时可选「模仿对象」——① 模仿真实用户（你自己）：伪装成你、在你这一侧（右侧气泡）说话；② 模仿某个角色 / 全部角色：伪装成群里的角色，左侧气泡、同名同头像，连你都难分辨谁是本体。每个分身都能自定义名字、头像、人设，也能像角色一样发红包、语音、表情、引用。列表里用蓝色「U·你」和橙色「C·角色」徽章一眼区分类型。",
  "✦ 分身玩法【模仿用户 · 两种模式】：针对「模仿你」的分身，新增「角色知道有冒充者」开关。开启＝群里角色会怀疑、试探、追问「到底哪个才是真的你」，几个「你」之间互相争身份、互咬，热闹又烧脑；关闭＝角色全员蒙在鼓里，把所有「你」当成同一个人，于是「你」就显得忽冷忽热、出尔反尔，上演一出「人格分裂剧场」，角色一脸懵地吐槽却想不到有人冒充。",
  "✦ 分身玩法【模仿角色 · 记忆不串味】：模仿角色的「影子」会和本体长得一模一样，但本体角色心里清楚有人在冒充自己，会当场反驳假货、戳穿矛盾，并主动向你证明「我才是真的本人」。最关键的是做了记忆隔离——冒充者说的话绝不会污染本体的私聊记忆，本体只会记得「群里有人模仿过我」，而不会把那些话当成自己说过的。",
  "✦ 群聊优化【角色不再无视你】：之前在群里发言，角色常常当没看见、自顾自继续聊别的。现已修复——你一开口，群成员会自然地接住并回应你说的内容，而不是集体装瞎。同时保留「潜水吃瓜」机制：你不发言时，角色们会自己水群、互相调侃，展现私下的群聊氛围。"
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