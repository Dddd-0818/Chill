// updater.js
'use strict';

const UpdateModule = (() => {
  // 🌟 每次更新时，只需要修改这个版本号和下面的更新内容即可！
  const CURRENT_VERSION = 'v4.0.0'; 
  const VERSION_KEY = 'chillos-last-version';
  const READ_SECONDS = 20; // ⏳ 强制阅读秒数：按钮锁定，倒计时结束才能点
  
 const CHANGELOG = [
  "✦ 全新功能【记忆库 · 不再整坨塞，散成条只取最相关的几条】：给 AI 装上长期记忆，但换了思路——不再把对话压成一整段越堆越长的摘要（那样越聊越占 token、越聊越「降智」），而是每轮自动把值得记的事拆成一条条独立记忆存起来，聊天时只召回最相关的 top-5 条。无论库里存了多少，每次注入的量恒定，token 不再随时间膨胀。桌面点「记忆库」图标进入，可查看 / 搜索 / 按角色筛选所有记忆，手动增删改。详见配套教程。",
  "✦ 记忆库【独立抽取 API 池 · 不占用聊天主线】：记忆抽取走自己独立的 API 池，在后台跑，不抢你聊天的 API、不拖慢回复。池子从上到下轮询，第一个报错 / 超时就自动顺延到下一个，把最稳的放最上面即可。测试通过会亮绿灯，且绿灯状态会保存，重开仍在。详见配套教程。",
  "✦ 记忆库【召回设置 · top-k 与抽取间隔可调】：「每轮召回条数」控制每次注入几条记忆（默认 5）；「自动抽取间隔」控制每隔几轮才抽一次——设成「每 2~3 轮」能把抽取 API 的调用量直接砍到 1/2~1/3，省额度省钱，对单聊群聊都生效。详见配套教程。",
  "✦ 记忆库【手动记一条 · 关系默契这类手写最准】：自动抽取偶尔会漏或记歪，可随时手动补。点「＋ 手动记一条」会先弹角色选择，选定这条记忆属于谁再填内容。人物关系、积怨默契这类自动管线容易记歪的，建议手写。每条记忆都能编辑 / 删除，抽歪了直接改，不用整批重来。",
  "✦ 记忆库【群聊也有记忆了】：群聊同样支持召回和抽取。群里聊天会自动取出全体成员的相关记忆（包括你和某个成员单聊时记下的事），让角色想起跨场景发生过的事；每轮结束后自动把这轮值得记的事拆成记忆、归到全体成员名下，卡片标「群聊」来源。群聊记忆为全体成员共享，群里的事你之后单独和某成员聊也会被召回到。",
  "✦ 记忆库【从旧版「提炼更新」一键迁移】：之前用旧版记忆中枢攒的摘要，可一次性搬进记忆库拆成离散条目。在「召回设置」底部「从旧记忆导入」，弹出角色多选（显示每个角色旧记忆字数，方便分批），勾选后逐个抽取入库。只需跑一次；结果不满意可「清空已导入」一键删掉所有 LEGACY 条目（不动你手动记的和聊天抽的），调整后重导。详见配套教程。",
  "✦ 美化设置【记忆库图标可自定义】：美化设置 → 自定义图标里补上了「记忆库」一格，现在能给它换成你喜欢的图标，也能跟随主题一起导出 / 导入，「恢复所有图标默认」同样覆盖到它。",
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