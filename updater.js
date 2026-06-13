// updater.js
'use strict';

const UpdateModule = (() => {
  // 🌟 每次更新时，只需要修改这个版本号和下面的更新内容即可！
  const CURRENT_VERSION = 'v3.8.0'; 
  const VERSION_KEY = 'chillos-last-version';
  const READ_SECONDS = 20; // ⏳ 强制阅读秒数：按钮锁定，倒计时结束才能点
  
  const CHANGELOG = [
  "✦ 群聊新功能【角色能发语音了】：群聊里的角色现在也能发语音条了，复用 MiniMax 音色引擎，每个角色按各自配置的音色说话、互不串音；多句回复会逐条自然播放。外语语音同样只朗读原文、不读翻译括号。（用户自己的人设不需要配音色，沿用单聊逻辑。）",
  "✦ 群聊优化【角色不再无视你】：之前在群里发言，角色常常当没看见、自顾自继续聊别的。现已修复——你一开口，群成员会自然地接住并回应你说的内容，而不是集体装瞎。修复了分身消息被误判成「角色已回应」导致系统让大家忽略你的根因。同时保留「潜水吃瓜」机制：你不发言时，角色们会自己水群、互相调侃，展现私下的群聊氛围。",
  "✦ 新功能【角色会查天气了】：现在可以让角色帮你查实时天气。聊天里随口问一句「外面冷不冷」「明天要不要带伞」「东京现在什么天气」，角色就会自己去查当地的真实天气再回你，而不是瞎编。查询时有轻提示，查完自然融进对话——不是干巴巴报数据，而是带着关心的口吻跟你说。支持全球城市，重名城市也能识别到正确的那个。",
  "✦ 新功能【双语翻译 · 译文随回复一起出】：开启后，角色发外语消息时，中文译文会随气泡一起出现，点一下气泡就能收起 / 展开译文，不打断阅读节奏。已优化识别逻辑：只有真正的外语句后面跟的译文括号才会被收进译文区，中文旁白、动作描写（如「（小声嘀咕）」）不会被误判；全角、半角括号都能识别；粤语等方言也支持。",
  "✦ 新功能【小红书分享 · 角色能刷帖】：在聊天里发一条小红书链接，角色会自动「读到」这篇帖子，并像刷到它一样跟你聊；聊天里还会显示一张精致的小红书卡片（封面图 + 标题 + 正文 + 点赞数）。若你用的是能识图的模型，角色还能真正「看到」封面图、描述图上的细节。需自行部署解析函数，详见配套教程。",
  "✦ 新功能【云端代答 · 切后台也能等回复】：开启后，等回复时切到后台 / 锁屏，回复改由云端跑完并通过系统推送送达，不用一直盯着屏幕干等。需已部署 cloud-reply 函数，详见配套教程。",
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
      .upd-btn.counting {
        background: var(--text-sub, #999); cursor: not-allowed; box-shadow: none; opacity: 0.65;
      }
      .upd-btn.counting:active { transform: none; }
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
        <button class="upd-btn counting" id="upd-confirm-btn" disabled onclick="UpdateModule.closeAndSave()">${READ_SECONDS}s</button>
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
        startCountdown();
      }, 800);
    }
  }

  // ⏳ 按钮倒计时：READ_SECONDS 秒内锁定，结束后解锁为 Got it
  function startCountdown() {
    const btn = document.getElementById('upd-confirm-btn');
    if (!btn) return;
    let left = READ_SECONDS;
    btn.classList.add('counting');
    btn.disabled = true;
    btn.textContent = `${left}s`;
    const timer = setInterval(() => {
      left--;
      if (left > 0) {
        btn.textContent = `${left}s`;
      } else {
        clearInterval(timer);
        btn.classList.remove('counting');
        btn.disabled = false;
        btn.textContent = 'Got it';
      }
    }, 1000);
  }

  function closeAndSave() {
    const btn = document.getElementById('upd-confirm-btn');
    if (btn && btn.disabled) return; // 倒计时未结束，不允许关闭
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