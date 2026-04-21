
'use strict';

// ============================================================
// ForumModule — ECHOES 回声沙龙 (高奢全功能版)
// ============================================================
const ForumModule = (() => {
    let _initialized = false;
    let _posts =[];
    let _forumProfile = { name: 'User', avatarKey: '' }; 
    let _eventImgFile = null; // 暂存图片文件
    let _eventImgUrl  = null; // 暂存预览链接
    let _postToDelete = null;

    function init() {
        if (_initialized) return;
        
        // 🌟 新增：暴力清理旧节点，防止热更新导致的 DOM 重叠/幽灵点击！
        const oldScreen = document.getElementById('forum-screen');
        if (oldScreen) oldScreen.remove();

        // 1. 注入专属样式
        const style = document.createElement('style');
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&family=Instrument+Serif:ital@0;1&display=swap');

            #forum-screen {
                --fm-bg: #070707;
                --fm-surface: #121212;
                --fm-surface-light: #1E1E1E;
                --fm-fg: #F0F0F0;
                --fm-fg-muted: #888888;
                --fm-line: rgba(255, 255, 255, 0.15);
                --fm-accent: #E8D3B9;
                
                --fm-font-mono: 'Space Grotesk', monospace, sans-serif;
                --fm-font-serif: 'Instrument Serif', serif;
                --fm-font-zh: 'Noto Sans SC', sans-serif;

                background-color: #000;
                color: var(--fm-fg);
                font-family: var(--fm-font-zh);
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
                z-index: 150;
            }

            #forum-screen .fm-app {
                width: 100%; height: 100%; position: relative;
                background: var(--fm-bg); display: flex; flex-direction: column;
                border-left: 1px solid var(--fm-line); border-right: 1px solid var(--fm-line);
                overflow: hidden;
            }

            #forum-screen .deco-circle {
                position: absolute; width: 300px; height: 300px;
                border: 1px solid var(--fm-line); border-radius: 50%;
                top: -100px; right: -150px; pointer-events: none; z-index: 0;
            }

            #forum-screen header {
                padding: max(env(safe-area-inset-top, 20px), 20px) 20px 10px;
                display: flex; justify-content: space-between; align-items: flex-end;
                border-bottom: 1px solid var(--fm-line); z-index: 10; background: var(--fm-bg);
            }
            #forum-screen .header-left { display: flex; align-items: flex-end; gap: 12px; }
            #forum-screen .logo-main {
                font-family: var(--fm-font-serif); font-size: 2.2rem; font-style: italic;
                line-height: 1; letter-spacing: -1px;
            }
            #forum-screen .logo-sub {
                font-family: var(--fm-font-mono); font-size: 0.55rem; color: var(--fm-fg-muted);
                text-transform: uppercase; letter-spacing: 0.2em; margin-top: 4px;
            }
            #forum-screen .header-actions { display: flex; gap: 10px; margin-bottom: 4px; }
            #forum-screen .icon-btn {
                width: 32px; height: 32px; border: 1px solid var(--fm-line);
                display: flex; align-items: center; justify-content: center;
                font-size: 1.1rem; background: var(--fm-surface); color: var(--fm-fg);
                cursor: pointer; border-radius: 8px; transition: transform 0.2s;
            }
            #forum-screen .icon-btn:active { transform: scale(0.9); }
            #forum-screen .icon-btn.circle { border-radius: 50%; }

            #forum-screen .fm-profile-pill {
                display: flex; align-items: center; gap: 6px;
                background: rgba(255,255,255,0.05); padding: 4px 10px 4px 4px;
                border-radius: 20px; border: 1px solid var(--fm-line);
                margin-right: 6px;
            }
            #forum-screen .fm-profile-avatar {
                width: 24px; height: 24px; border-radius: 50%; object-fit: cover; cursor: pointer;
                border: 1px solid rgba(255,255,255,0.1);
            }
            #forum-screen .fm-profile-name {
                background: transparent; border: none; outline: none;
                color: var(--fm-fg); font-family: var(--fm-font-mono); font-size: 0.7rem;
                width: 65px; font-weight: 500; text-overflow: ellipsis;
            }
            #forum-screen .fm-profile-name:focus { border-bottom: 1px solid var(--fm-fg-muted); }

            #forum-screen .filters {
                padding: 12px 20px; display: flex; gap: 8px; z-index: 10; background: var(--fm-bg);
                border-bottom: 1px solid var(--fm-line); overflow-x: auto; scrollbar-width: none;
            }
            #forum-screen .filters::-webkit-scrollbar { display: none; }
            #forum-screen .filter-pill {
                padding: 4px 14px; border: 1px solid var(--fm-line); border-radius: 20px;
                font-family: var(--fm-font-zh); font-size: 0.75rem; color: var(--fm-fg-muted);
                cursor: pointer; transition: all 0.2s; white-space: nowrap;
            }
            #forum-screen .filter-pill.active { background: var(--fm-fg); color: var(--fm-bg); border-color: var(--fm-fg); }

            #forum-screen main { flex: 1; overflow-y: auto; padding-bottom: 120px; z-index: 1; scrollbar-width: none; }
            #forum-screen main::-webkit-scrollbar { display: none; }

            #forum-screen .meta-data {
                font-family: var(--fm-font-mono); font-size: 0.6rem; color: var(--fm-fg-muted);
                text-transform: uppercase; letter-spacing: 0.1em;
            }

            #forum-screen .post-card {
                margin: 20px; border: 1px solid var(--fm-line); border-radius: 12px;
                background: var(--fm-surface); position: relative; overflow: hidden;
            }

            /* Event Card */
            #forum-screen .event-visual { position: relative; height: 350px; background: var(--fm-surface); overflow: hidden; }
            #forum-screen .event-bg {
                width: 100%; height: 100%; object-fit: cover;
                filter: brightness(0.6) contrast(1.1); position: absolute; top: 0; left: 0;
            }
            #forum-screen .event-overlay {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                padding: 20px; display: flex; flex-direction: column; justify-content: space-between;
            }
            #forum-screen .event-title {
                font-family: var(--fm-font-serif); font-size: 3.5rem; line-height: 0.9;
                font-style: italic; text-shadow: 2px 2px 10px rgba(0,0,0,0.8); mix-blend-mode: exclusion;
            }
            #forum-screen .event-desc {
                background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
                padding: 12px; border: 1px solid var(--fm-line); border-radius: 8px;
                font-size: 0.9rem; font-weight: 300; max-width: 80%; margin-top: 10px;
            }
            
            #forum-screen .floating-bubble {
                position: absolute; padding: 8px 12px; font-size: 0.8rem; font-weight: 700;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 5; display: flex; align-items: center; gap: 6px;
            }
            #forum-screen .bubble-1 {
                bottom: 65px; right: 15px; transform: rotate(-5deg);
                background: var(--fm-fg); color: var(--fm-bg); border-radius: 16px 16px 16px 0;
            }
            #forum-screen .bubble-2 {
                top: 20px; right: 20px; transform: rotate(3deg);
                background: var(--fm-surface-light); color: var(--fm-fg); border: 1px solid var(--fm-line); border-radius: 16px 16px 0 16px;
            }
            #forum-screen .inner-interaction { display: flex; gap: 16px; margin-top: auto; position: relative; z-index: 10; }

            /* Square Card */
            #forum-screen .square-visual { padding: 20px; }
            #forum-screen .sq-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 16px; border-bottom: 1px dashed var(--fm-line); padding-bottom: 12px;
            }
            #forum-screen .sq-user { display: flex; align-items: center; gap: 10px; }
            #forum-screen .sq-avatar { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; }
            #forum-screen .sq-name { font-family: var(--fm-font-mono); font-weight: 700; font-size: 1rem; }
            #forum-screen .sq-id { font-family: var(--fm-font-mono); font-size: 0.6rem; color: var(--fm-fg-muted); }
            #forum-screen .sq-content { font-size: 0.95rem; line-height: 1.6; margin-bottom: 16px; color: #d0d0d0; }
            
            #forum-screen .sq-panel {
                display: flex; gap: 10px; background: var(--fm-surface-light);
                padding: 10px; border-radius: 8px; align-items: center;
            }
            #forum-screen .waveform {
                flex: 1; height: 20px; background: repeating-linear-gradient(90deg, var(--fm-fg-muted) 0px, var(--fm-fg-muted) 2px, transparent 2px, transparent 4px); opacity: 0.5;
            }
            #forum-screen .sq-toggle { width: 32px; height: 16px; border: 1px solid var(--fm-line); border-radius: 10px; position: relative; }
            #forum-screen .sq-toggle::after {
                content: ''; position: absolute; width: 10px; height: 10px; background: var(--fm-fg);
                border-radius: 50%; top: 2px; right: 2px;
            }

            /* Treehole Card */
            #forum-screen .treehole-visual {
                padding: 24px; position: relative;
                background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px);
            }
            #forum-screen .th-badge {
                position: absolute; top: 0; right: 24px; background: var(--fm-fg); color: var(--fm-bg);
                padding: 4px 8px; border-radius: 0 0 4px 4px;
                font-family: var(--fm-font-mono); font-size: 0.6rem; font-weight: 700;
            }
            #forum-screen .th-content {
                font-size: 1rem; line-height: 1.5; color: var(--fm-fg-muted);
                filter: blur(1.5px); transition: filter 0.3s;
            }
            #forum-screen .treehole-visual:active .th-content { filter: blur(0); }

            #forum-screen .interaction-bar {
                display: flex; justify-content: space-between; align-items: center;
                padding: 12px 20px; border-top: 1px solid var(--fm-line); background: var(--fm-surface);
            }
            
            #forum-screen .int-btn {
                display: flex; align-items: center; gap: 6px;
                font-family: var(--fm-font-mono); font-size: 0.75rem; color: var(--fm-fg-muted);
                cursor: pointer; transition: color 0.2s;
            }
            #forum-screen .int-btn:hover, #forum-screen .int-btn.active { color: var(--fm-fg); }
            #forum-screen .int-btn i { font-size: 1.1rem; }

            /* Inline Comments */
            #forum-screen .inline-comments {
                display: none; background: var(--fm-surface-light); padding: 0 20px 20px;
                border-top: 1px dashed var(--fm-line);
            }
            #forum-screen .inline-comments.expanded { display: block; }
            #forum-screen .comment-log {
                padding: 12px 4px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 4px;
                cursor: pointer; transition: background 0.2s; border-radius: 4px; margin: 0 -4px;
            }
            #forum-screen .comment-log:hover { background: rgba(255,255,255,0.03); }
            #forum-screen .comment-log:last-child { border-bottom: none; }
            #forum-screen .clog-meta {
                display: flex; gap: 8px; align-items: center;
                font-family: var(--fm-font-mono); font-size: 0.65rem; color: var(--fm-fg-muted);
            }
            #forum-screen .clog-name { font-weight: 700; }
            #forum-screen .clog-text { font-size: 0.85rem; line-height: 1.5; color: #ccc; }

            #forum-screen .minimal-input-area { 
                display: flex; align-items: flex-end; gap: 10px; margin-top: 16px; width: 100%; box-sizing: border-box; 
            }
            #forum-screen .console-prefix { 
                font-family: var(--fm-font-mono); color: var(--fm-fg-muted); font-size: 0.8rem; padding-bottom: 6px; flex-shrink: 0;
            }
            #forum-screen .minimal-input {
                flex: 1; min-width: 0; 
                background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.3);
                color: var(--fm-fg); font-family: var(--fm-font-zh); font-size: 0.85rem;
                padding: 6px 0; outline: none; transition: border-color 0.2s; border-radius: 0;
            }
            #forum-screen .minimal-input:focus { border-bottom-color: var(--fm-fg); }
            #forum-screen .minimal-send-btn {
                flex-shrink: 0; white-space: nowrap; 
                background: transparent; color: var(--fm-fg); border: 1px solid var(--fm-fg);
                font-family: var(--fm-font-mono); font-size: 0.65rem; font-weight: 700;
                padding: 6px 12px; border-radius: 4px; cursor: pointer; text-transform: uppercase; transition: all 0.2s;
            }
            #forum-screen .minimal-send-btn:active { background: var(--fm-fg); color: var(--fm-bg); }

            /* 发布面板 */
            #forum-screen .sys-panel {
                position: absolute; top: 100%; left: 0; width: 100%; height: 100%;
                background: var(--fm-bg); z-index: 100;
                transition: top 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex; flex-direction: column;
            }
            #forum-screen .sys-panel.active { top: 0; }
            #forum-screen .panel-header { padding: max(env(safe-area-inset-top, 20px), 20px) 20px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--fm-line); }
            #forum-screen .panel-title { font-family: var(--fm-font-mono); font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; }
            #forum-screen .panel-body { flex: 1; padding: 20px; overflow-y: auto; }
            #forum-screen .form-group { margin-bottom: 24px; }
            #forum-screen .form-label { font-family: var(--fm-font-mono); font-size: 0.65rem; color: var(--fm-fg-muted); margin-bottom: 8px; display: block; text-transform: uppercase; }
            #forum-screen .form-select, #forum-screen .form-textarea, #forum-screen .form-input { width: 100%; background: var(--fm-surface); color: var(--fm-fg); border: 1px solid var(--fm-line); font-family: var(--fm-font-zh); padding: 12px; outline: none; transition: border-color 0.2s; border-radius: 4px; }
            #forum-screen .form-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
            #forum-screen .fm-title-textarea { font-family: var(--fm-font-serif); font-size: 1.2rem; font-style: italic; resize: vertical; min-height: 48px; max-height: 90px; }
            #forum-screen .segment-control { display: flex; border: 1px solid var(--fm-line); margin-bottom: 20px; border-radius: 4px; overflow: hidden;}
            #forum-screen .seg-btn { flex: 1; text-align: center; padding: 10px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; border-right: 1px solid var(--fm-line); }
            #forum-screen .seg-btn:last-child { border-right: none; }
            #forum-screen .seg-btn.active { background: var(--fm-fg); color: var(--fm-bg); font-weight: 500; }
            #forum-screen .btn-primary { width: 100%; background: var(--fm-fg); color: var(--fm-bg); border: none; padding: 14px; font-family: var(--fm-font-mono); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; cursor: pointer; margin-top: 10px; border-radius: 4px; }

            /* 图片上传组件 */
            #forum-screen .fm-upload-box { border: 1px dashed var(--fm-line); border-radius: 4px; padding: 20px; text-align: center; cursor: pointer; color: var(--fm-fg-muted); transition: border-color 0.2s; position: relative; overflow: hidden; background: rgba(255,255,255,0.02); }
            #forum-screen .fm-upload-box:active { border-color: var(--fm-fg); }
            #forum-screen .fm-upload-box i { font-size: 1.6rem; margin-bottom: 6px; color: var(--fm-fg); opacity: 0.8; }
            #forum-screen .fm-upload-box span { display: block; font-family: var(--fm-font-mono); font-size: 0.65rem; letter-spacing: 1px; }
            #forum-screen .fm-img-preview-wrap { position: relative; display: none; width: 100%; height: 160px; border-radius: 4px; overflow: hidden; border: 1px solid var(--fm-line); }
            #forum-screen .fm-img-preview-wrap img { width: 100%; height: 100%; object-fit: cover; }
            #forum-screen .fm-img-remove { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; transition: 0.2s; }
            /* 危险操作警报弹窗 */
            #forum-screen .fm-modal-overlay {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7); backdrop-filter: blur(5px);
                z-index: 200; display: flex; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
            }
            #forum-screen .fm-modal-overlay.active {
                opacity: 1; pointer-events: auto;
            }
            #forum-screen .fm-modal {
                background: var(--fm-surface); border: 1px solid rgba(255, 77, 79, 0.3);
                border-radius: 12px; padding: 24px; width: 80%; max-width: 320px;
                transform: translateY(20px) scale(0.95); 
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 10px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255, 77, 79, 0.05);
                text-align: center;
            }
            #forum-screen .fm-modal-overlay.active .fm-modal {
                transform: translateY(0) scale(1);
            }
            #forum-screen .fm-modal-icon {
                font-size: 2.5rem; color: #ff4d4f; margin-bottom: 12px;
                animation: fm-pulse 2s infinite;
            }
            @keyframes fm-pulse {
                0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; }
            }
            #forum-screen .fm-modal-title {
                font-family: var(--fm-font-mono); font-size: 1rem; font-weight: 700; 
                margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; color: #ff4d4f;
            }
            #forum-screen .fm-modal-desc {
                font-size: 0.85rem; color: var(--fm-fg-muted); margin-bottom: 24px; line-height: 1.6;
            }
            #forum-screen .fm-modal-actions { display: flex; gap: 12px; }
            #forum-screen .fm-btn {
                flex: 1; padding: 12px; border-radius: 6px; font-family: var(--fm-font-mono); 
                font-size: 0.8rem; cursor: pointer; transition: 0.2s; font-weight: 700; 
                text-transform: uppercase; letter-spacing: 1px;
            }
            #forum-screen .fm-btn-cancel {
                background: transparent; border: 1px solid var(--fm-line); color: var(--fm-fg);
            }
            #forum-screen .fm-btn-cancel:active { background: rgba(255,255,255,0.1); }
            #forum-screen .fm-btn-danger {
                background: rgba(255, 77, 79, 0.1); border: 1px solid #ff4d4f; color: #ff4d4f;
            }
            #forum-screen .fm-btn-danger:active { background: #ff4d4f; color: #fff; }
            /* 假装是图片的加密视觉组件 */
            #forum-screen .fm-fake-img-wrap {
                position: relative; width: 100%; height: 160px; background: #121212;
                border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; margin: 12px 0;
                cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center;
                transition: border-color 0.3s;
            }
            #forum-screen .fm-fake-img-wrap:active { border-color: var(--fm-fg); }
            #forum-screen .fm-fake-img-cover {
                position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
                color: var(--fm-fg-muted); transition: opacity 0.4s ease; z-index: 2; background: #121212;
            }
            #forum-screen .fm-fake-img-cover i { font-size: 2rem; margin-bottom: 8px; }
            #forum-screen .fm-fake-img-cover span { font-family: var(--fm-font-mono); font-size: 0.65rem; text-align: center; letter-spacing: 2px; }
            #forum-screen .fm-fake-img-desc {
                opacity: 0; padding: 20px; font-size: 0.85rem; color: #d0d0d0; font-style: italic; line-height: 1.6;
                text-align: center; transform: translateY(10px); transition: all 0.4s ease; z-index: 1;
            }
            #forum-screen .fm-fake-img-wrap.revealed .fm-fake-img-cover { opacity: 0; pointer-events: none; }
            #forum-screen .fm-fake-img-wrap.revealed .fm-fake-img-desc { opacity: 1; transform: translateY(0); }
        `;
        document.head.appendChild(style);

        // 2. 注入 HTML 结构
        const screen = document.createElement('div');
        screen.id = 'forum-screen';
        screen.className = 'screen';
        screen.innerHTML = `
            <div class="fm-app">
                <div class="deco-circle"></div>
                <header>
                    <div class="header-left">
                        <div class="icon-btn circle" onclick="Router.back()" style="margin-right: 8px;"><i class="ph ph-caret-left"></i></div>
                        <div class="logo-block">
                            <div class="logo-main">Echoes</div>
                            <div class="logo-sub">sys.ver_2.0.4</div>
                        </div>
                    </div>
                    <div class="header-actions" style="align-items: center;">
                        <div class="fm-profile-pill">
                            <img src="" id="fm-user-avatar" class="fm-profile-avatar" onclick="document.getElementById('fm-upload-avatar-profile').click()" title="更换论坛头像">
                            <input type="text" id="fm-user-name" class="fm-profile-name" onchange="ForumModule.updateForumName(this.value)" title="修改论坛昵称">
                        </div>
                        <div class="icon-btn" onclick="ForumModule.openPanel('fm-world-panel')"><i class="ph ph-globe-hemisphere-west"></i></div>
                        <div class="icon-btn" onclick="ForumModule.openPanel('fm-compose-panel')"><i class="ph ph-pen-nib"></i></div>
                    </div>
                </header>
                <input type="file" id="fm-upload-avatar-profile" style="display:none" accept="image/*" onchange="ForumModule.changeForumAvatar(event)">

                <div class="filters">
                    <div class="filter-pill active" onclick="ForumModule.filterFeed('all', this)">全部记录</div>
                    <div class="filter-pill" onclick="ForumModule.filterFeed('event', this)">世界事件</div>
                    <div class="filter-pill" onclick="ForumModule.filterFeed('square', this)">角色广场</div>
                    <div class="filter-pill" onclick="ForumModule.filterFeed('treehole', this)">匿名树洞</div>
                </div>

                <main id="fm-feed-container"></main>

                <div class="sys-panel" id="fm-world-panel">
                    <div class="panel-header">
                        <div class="panel-title">World_Architecture</div>
                        <div class="icon-btn" onclick="ForumModule.closePanel('fm-world-panel')"><i class="ph ph-x"></i></div>
                    </div>
                    <div class="panel-body">
                        <div style="color:var(--fm-fg-muted);font-size:0.8rem;text-align:center;padding-top:40px;">[ 正在桥接 WorldBook 引擎... ]<br><br>稍后开放</div>
                    </div>
                </div>

                <div class="sys-panel" id="fm-compose-panel">
                    <div class="panel-header">
                        <div class="panel-title">Signal_Transmission</div>
                        <div class="icon-btn" onclick="ForumModule.closePanel('fm-compose-panel')"><i class="ph ph-x"></i></div>
                    </div>
                    <div class="panel-body">
                        <div class="segment-control">
                            <div class="seg-btn active" onclick="ForumModule.switchComposeType('event', this)" id="fm-tab-event">发世界事件</div>
                            <div class="seg-btn" onclick="ForumModule.switchComposeType('treehole', this)" id="fm-tab-treehole">发匿名树洞</div>
                        </div>

                        <div id="fm-form-event-area">
                            <div class="form-group">
                                <label class="form-label">Visual Archive / 视觉档案</label>
                                <div class="fm-upload-box" id="fm-event-upload-box" onclick="document.getElementById('fm-event-file').click()">
                                    <i class="ph-thin ph-image"></i>
                                    <span>TAP TO UPLOAD IMAGE</span>
                                </div>
                                <div class="fm-img-preview-wrap" id="fm-event-img-wrap">
                                    <img id="fm-event-img-preview" src="" alt="">
                                    <button class="fm-img-remove" onclick="ForumModule.removeEventImg()"><i class="ph ph-x"></i></button>
                                </div>
                                <input type="file" id="fm-event-file" accept="image/*" style="display:none;" onchange="ForumModule.onEventImgSelected(event)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Headline / 核心事件</label>
                                <textarea id="fm-event-title" class="form-input fm-title-textarea" placeholder="e.g. CITY BLACKOUT" rows="2"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description / 事件详述</label>
                                <textarea id="fm-event-desc" class="form-textarea" placeholder="描述发生的客观事件..."></textarea>
                            </div>
                        </div>

                        <div id="fm-form-treehole-area" style="display:none;">
                            <div class="form-group">
                                <label class="form-label">Classified Message / 加密信息</label>
                                <textarea id="fm-treehole-content" class="form-textarea" style="filter: blur(0.5px);" placeholder="输入你想匿名倾诉的话..."></textarea>
                            </div>
                            <div class="meta-data" style="margin-bottom: 20px;"><i class="ph ph-shield-check"></i> ANONYMOUS_ROUTING_ENABLED</div>
                        </div>

                        <button class="btn-primary" onclick="ForumModule.publishPost()">BROADCAST</button>
                    </div>
                </div>
                <!-- 自定义删除确认弹窗 -->
                <div class="fm-modal-overlay" id="fm-delete-modal">
                    <div class="fm-modal">
                        <div class="fm-modal-icon"><i class="ph-fill ph-warning-circle"></i></div>
                        <div class="fm-modal-title">System Warning</div>
                        <div class="fm-modal-desc">确认抹除这条数据记录？<br>操作不可逆，空间信号将永久断开。</div>
                        <div class="fm-modal-actions">
                            <button class="fm-btn fm-btn-cancel" onclick="ForumModule.cancelDelete()">Cancel</button>
                            <button class="fm-btn fm-btn-danger" id="fm-confirm-delete-btn">Erase</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.device').appendChild(screen);

        document.addEventListener('keypress', function(e) {
            if (document.getElementById('forum-screen')?.classList.contains('active')) {
                if (e.key === 'Enter' && e.target.classList.contains('minimal-input')) {
                    // Fix bug: replace instead of split to ensure complete target ID parsing
                    ForumModule.addComment(e.target.id.replace('fm-input-', ''));
                }
            }
        });

        _initialized = true;

        // 🌟 开启暗网心跳：支持状态无损保持 (输入框文字与焦点不丢)
        let isHeartbeatRunning = false;
        setInterval(async () => {
            if(isHeartbeatRunning) return;
            isHeartbeatRunning = true;
            try {
                const screen = document.getElementById('forum-screen');
                if (screen && screen.classList.contains('active')) {
                    const now = Date.now();
                    let needRefresh = false;
                    for (const p of _posts) {
                        if (p.comments.some(c => c.timestamp <= now && c.timestamp > now - 3500)) {
                            needRefresh = true;
                            break;
                        }
                    }
                    if (needRefresh) {
                        const activePill = document.querySelector('#forum-screen .filter-pill.active');
                        let type = 'all';
                        if (activePill) {
                            if (activePill.innerText.includes('事件')) type = 'event';
                            else if (activePill.innerText.includes('广场')) type = 'square';
                            else if (activePill.innerText.includes('树洞')) type = 'treehole';
                        }
                        // 传入 true 以保留用户的点开面板状态和输入状态
                        await _filterAndRender(type, true);
                    }
                }
            } finally {
                isHeartbeatRunning = false;
            }
        }, 3000);
    }

    async function onEnter() {
        if (!_initialized) init();
        try {
            let savedForum = await DB.settings.get('forum-profile');
            if (!savedForum) {
                const globalProfile = await DB.settings.get('global-profile') || { name: 'User', avatarKey: '' };
                savedForum = { name: globalProfile.name, avatarKey: globalProfile.avatarKey };
                await DB.settings.set('forum-profile', savedForum);
            }
            _forumProfile = savedForum;
            document.getElementById('fm-user-name').value = _forumProfile.name;
            const url = _forumProfile.avatarKey ? await Assets.getUrl(_forumProfile.avatarKey).catch(()=>'') : '';
            document.getElementById('fm-user-avatar').src = url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80;q=80';
        } catch(e) { console.warn('[ForumModule] Load profile error', e); }
        await loadPosts();
    }

    // --- 核心算法 ---
    function _getMorandiColor(str) {
        if (!str || str === 'OBS_0x') return '#888888';
        if (str === _forumProfile.name) return '#E8D3B9';
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        const h = Math.abs(hash) % 360, s = 25 + (Math.abs(hash) % 20), l = 65 + (Math.abs(hash) % 15);
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    function _generateAvatarSVG(name) {
        const color = _getMorandiColor(name), initial = (name || 'X').charAt(0).toUpperCase();
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${color}"/><text x="50%" y="54%" font-family="sans-serif" font-weight="bold" font-size="45" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">${initial}</text></svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    // --- 数据处理 ---
    async function loadPosts(preserveState = false) {
        try { _posts = await DB.forum.getAll(); _posts.sort((a, b) => b.timestamp - a.timestamp); } catch(e) { _posts =[]; }
        const activePill = document.querySelector('#forum-screen .filter-pill.active');
        let type = 'all';
        if (activePill) {
            if (activePill.innerText.includes('事件')) type = 'event';
            else if (activePill.innerText.includes('广场')) type = 'square';
            else if (activePill.innerText.includes('树洞')) type = 'treehole';
        }
        await _filterAndRender(type, preserveState);
    }

    // 新增：保留UI状态的无感重绘
    async function _filterAndRender(type, preserveState = false) {
        let expandedIds =[];
        let inputValues = {};
        let focusedId = null;
        let cursorStart = 0;
        let cursorEnd = 0;

        if (preserveState) {
            document.querySelectorAll('#forum-screen .inline-comments.expanded').forEach(el => {
                expandedIds.push(el.id.replace('fm-comments-', ''));
            });
            document.querySelectorAll('#forum-screen .minimal-input').forEach(el => {
                if(el.value) inputValues[el.id] = el.value;
            });
            if (document.activeElement && document.activeElement.classList.contains('minimal-input')) {
                focusedId = document.activeElement.id;
                cursorStart = document.activeElement.selectionStart;
                cursorEnd = document.activeElement.selectionEnd;
            }
        }

        const filtered = type === 'all' ? _posts : _posts.filter(p => p.type === type);
        const container = document.getElementById('fm-feed-container');
        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:80px 20px;color:var(--fm-fg-muted);font-family:var(--fm-font-mono);font-size:0.6rem;letter-spacing:2px;text-transform:uppercase;">NO CLASSIFIED DATA FOUND</div>';
            return;
        }

        let html = '';
        for (const post of filtered) {
            let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';
            if (post.avatarKey) avatarUrl = await Assets.getUrl(post.avatarKey).catch(()=>'') || avatarUrl;
            
            for (const c of post.comments) {
                if (c.avatarKey) c._avatarUrl = await Assets.getUrl(c.avatarKey).catch(()=>'') || _generateAvatarSVG(c.author);
                else c._avatarUrl = c.avatar || _generateAvatarSVG(c.author);
            }

            let eventImgUrl = post.image || 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&q=80';
            if (post.imageKey) eventImgUrl = await Assets.getUrl(post.imageKey).catch(()=>'') || eventImgUrl;
            html += renderPostHTML(post, avatarUrl, eventImgUrl);
        }
        container.innerHTML = html;

        if (preserveState) {
            expandedIds.forEach(id => {
                const sec = document.getElementById(`fm-comments-${id}`);
                const btn = document.getElementById(`fm-btn-msg-${id}`);
                if (sec) sec.classList.add('expanded');
                if (btn) btn.classList.add('active');
            });
            for (let id in inputValues) {
                const el = document.getElementById(id);
                if (el) el.value = inputValues[id];
            }
            if (focusedId) {
                const el = document.getElementById(focusedId);
                if (el) {
                    el.focus();
                    try { el.setSelectionRange(cursorStart, cursorEnd); } catch(e){}
                }
            }
        }
    }

    function filterFeed(type, el) {
        if (el) { document.querySelectorAll('#forum-screen .filter-pill').forEach(pill => pill.classList.remove('active')); el.classList.add('active'); }
        _filterAndRender(type, false);
    }

    function renderCommentsHTML(post) {
        const now = Date.now();
        // 分离已经到时间的评论和未来评论
        const visibleComments = post.comments.filter(c => c.timestamp <= now);
        const pendingCount = post.comments.length - visibleComments.length;

        // 新增点击触发回复交互
        let commentsList = visibleComments.map(c => `
            <div class="comment-log" onclick="ForumModule.prepareReply('${post.id}', '${_escHtml(c.author)}')">
                <div class="clog-meta">
                    <span class="clog-name" style="color: ${_getMorandiColor(c.author)};">${_escHtml(c.author)}</span>
                    <span class="clog-time">${c.time}</span>
                </div>
                <div class="clog-text">${_escHtml(c.text)}</div>
            </div>
        `).join('');

        if (visibleComments.length === 0) {
            commentsList = `<div class="meta-data" style="padding:10px 0;text-align:center;">NO_LOGS_FOUND</div>`;
        }

        let loadMoreHTML = '';
        if (pendingCount > 0) {
            loadMoreHTML = `<div style="text-align:center; padding: 12px 0 4px; border-top: 1px dashed rgba(255,255,255,0.05); margin-top: 8px;">
                 <span style="font-family:var(--fm-font-mono); font-size:0.6rem; color:var(--fm-fg-muted); letter-spacing:2px; text-transform:uppercase;">[ <i class="ph-thin ph-asterisk" style="animation:spin 1s linear infinite; display:inline-block;"></i> INTERCEPTING SIGNAL... ]</span></div>`;
        } else if (visibleComments.length > 0) {
            loadMoreHTML = `<div style="text-align:center; padding: 12px 0 4px; border-top: 1px dashed rgba(255,255,255,0.05); margin-top: 8px;">
                 <button id="fm-load-more-${post.id}" onclick="ForumModule.loadMoreComments('${post.id}')" style="background:transparent; border:none; font-family:var(--fm-font-mono); font-size:0.6rem; color:var(--fm-fg-muted); letter-spacing:2px; cursor:pointer; text-transform:uppercase; transition:0.2s;" onmousedown="this.style.color='#fff'" onmouseup="this.style.color='var(--fm-fg-muted)'">
                    [ DECRYPT MORE LOGS... ]</button></div>`;
        }

        return `
            <div class="inline-comments" id="fm-comments-${post.id}">
                ${commentsList}
                ${loadMoreHTML}
                <div class="minimal-input-area">
                    <span class="console-prefix">>_</span>
                    <input type="text" class="minimal-input" id="fm-input-${post.id}" placeholder="添加观测记录..." autocomplete="off">
                    <button class="minimal-send-btn" onclick="ForumModule.addComment('${post.id}')">SEND</button>
                </div>
            </div>
        `;
    }

    function renderPostHTML(post, avatarUrl, eventImgUrl) {
        let visualHTML = '', interactionHTML = ''; 
        // 🌟 新增：在这里生成“加密视觉”组件的HTML
        let fakeImgHTML = '';
        if (post.hasImage && post.imageDesc) {
            // 使用我们刚才在 CSS 里定义好的样式
            fakeImgHTML = `
            <div class="fm-fake-img-wrap" onclick="this.classList.toggle('revealed')">
               <div class="fm-fake-img-cover">
                   <i class="ph-thin ph-lock-key"></i>
                   <span>[ ENCRYPTED VISUAL ]<br>TAP TO DECRYPT</span>
               </div>
               <div class="fm-fake-img-desc">${_escHtml(post.imageDesc)}</div>
            </div>`;
        }
        if (post.type === 'event') {
            visualHTML = `
                <div class="event-visual">
                    <img src="${eventImgUrl}" class="event-bg">
                    <div class="event-overlay">
                        <div class="meta-data">[WORLD_EVENT] // TIME: ${_formatDate(post.timestamp)}</div>
                        <div style="margin-bottom: 30px;">
                            <div class="event-title">${_escHtml(post.title)}</div>
                            <div class="event-desc">${_escHtml(post.desc)}</div>
                        </div>
                        <div class="inner-interaction">
                            <div class="int-btn" onclick="ForumModule.toggleComments('${post.id}')" id="fm-btn-msg-${post.id}"><i class="ph ph-chat-centered-text"></i> ${post.comments.length} RESPONSES</div>
                            <div class="int-btn" onclick="ForumModule.deletePost('${post.id}')" style="margin-left:auto;"><i class="ph-thin ph-trash"></i> DELETE</div>
                        </div>
                    </div>
                    <div class="floating-bubble bubble-2"><i class="ph ph-warning-circle"></i> NEW_EVENT</div>
                    ${post.comments.length > 0 ? `<div class="floating-bubble bubble-1"><img src="${post.comments[0]._avatarUrl}" style="width:18px;height:18px;border-radius:50%; object-fit:cover; margin-right:4px;"><span style="color:${_getMorandiColor(post.comments[0].author)}">${_escHtml(post.comments[0].author)}</span> 留下了记录</div>` : ''}
                </div>
            `;
        }  else if (post.type === 'square') {
            // 🌟 修改：在正文(sq-content)和音频面板(sq-panel)之间，插入 fakeImgHTML
            visualHTML = `<div class="square-visual"><div class="sq-header"><div class="sq-user"><img src="${avatarUrl}" class="sq-avatar"><div><div class="sq-name">${_escHtml(post.author)}</div><div class="sq-id">@${_escHtml(post.author.toLowerCase().replace(/\\s/g,'_'))}</div></div></div><div class="meta-data" style="color:var(--fm-fg-muted);"><i class="ph ph-wifi-high"></i> ONLINE</div></div><div class="sq-content">${_escHtml(post.content)}</div>${fakeImgHTML}<div class="sq-panel"><div class="meta-data" style="writing-mode: vertical-rl; transform: rotate(180deg);">FREQ</div><div class="waveform"></div><div class="sq-toggle"></div></div></div>`;
            interactionHTML = `<div class="interaction-bar"><div class="int-btn" onclick="ForumModule.toggleComments('${post.id}')" id="fm-btn-msg-${post.id}"><i class="ph ph-chat-centered-text"></i> ${post.comments.length}</div><div class="int-btn" onclick="ForumModule.deletePost('${post.id}')"><i class="ph-thin ph-trash"></i></div></div>`;
        } else if (post.type === 'treehole') {
            // 🌟 修改：在正文(th-content)之后，插入 fakeImgHTML
            visualHTML = `<div class="treehole-visual"><div class="th-badge">CLASSIFIED</div><div class="meta-data" style="margin-bottom: 12px; border-bottom:1px solid var(--fm-line); padding-bottom:8px;"><i class="ph ph-lock-key"></i> ENCRYPTED_LOG // DECRYPT_ON_HOVER</div><div class="th-content">${_escHtml(post.content)}</div>${fakeImgHTML}</div>`;
            interactionHTML = `<div class="interaction-bar"><div class="int-btn" onclick="ForumModule.toggleComments('${post.id}')" id="fm-btn-msg-${post.id}"><i class="ph ph-chat-centered-text"></i> ${post.comments.length}</div><div class="int-btn" onclick="ForumModule.deletePost('${post.id}')"><i class="ph-thin ph-trash"></i></div></div>`;
        }
        return `<div class="post-card">${visualHTML}${interactionHTML}${renderCommentsHTML(post)}</div>`;
    }

    // --- 逻辑函数 ---
    function prepareReply(postId, authorName) {
        const input = document.getElementById(`fm-input-${postId}`);
        if (input) {
            const prefix = `回复 @${authorName}: `;
            let text = input.value;
            // 清理旧的回复前缀，如果用户反复点击不同的人，直接替换艾特对象即可
            text = text.replace(/^回复\s*@[^:]+:\s*/, '');
            input.value = prefix + text;
            input.focus();
        }
    }

    function onEventImgSelected(e) {
        const file = e.target.files[0]; if(!file) return;
        _eventImgFile = file;
        if (_eventImgUrl) URL.revokeObjectURL(_eventImgUrl);
        _eventImgUrl = URL.createObjectURL(file);
        document.getElementById('fm-event-upload-box').style.display = 'none';
        document.getElementById('fm-event-img-preview').src = _eventImgUrl;
        document.getElementById('fm-event-img-wrap').style.display = 'block';
        e.target.value = '';
    }

    function removeEventImg() {
        if (_eventImgUrl) URL.revokeObjectURL(_eventImgUrl);
        _eventImgFile = null; _eventImgUrl = null;
        document.getElementById('fm-event-img-preview').src = '';
        document.getElementById('fm-event-img-wrap').style.display = 'none';
        document.getElementById('fm-event-upload-box').style.display = 'block';
    }

    async function changeForumAvatar(e) {
        const file = e.target.files[0]; if(!file) return;
        try {
            const key = `fm-avatar-${Date.now()}`;
            const url = await Assets.save(key, file, 400, 0.85);
            _forumProfile.avatarKey = key;
            await DB.settings.set('forum-profile', _forumProfile);
            document.getElementById('fm-user-avatar').src = url;
            Toast.show('论坛专属头像已更新');
        } catch(err) { Toast.show('上传失败'); }
    }

    async function updateForumName(val) {
        _forumProfile.name = val || 'User';
        await DB.settings.set('forum-profile', _forumProfile);
        Toast.show('论坛昵称已更新');
    }

    async function publishPost() {
        const type = document.querySelector('#forum-screen .seg-btn.active').id === 'fm-tab-event' ? 'event' : 'treehole';
        let post = { id: 'fp_' + Date.now(), type, timestamp: Date.now(), likes: 0, comments:[], author: _forumProfile.name, avatarKey: _forumProfile.avatarKey };

        if (type === 'event') {
            post.title = document.getElementById('fm-event-title').value.trim();
            post.desc = document.getElementById('fm-event-desc').value.trim();
            if (!post.title || !post.desc) { Toast.show('标题和详述不能为空'); return; }
            if (_eventImgFile) {
                const key = `forum-img-${Date.now()}`;
                await Assets.save(key, _eventImgFile, 1200, 0.85);
                post.imageKey = key;
            }
        } else {
            post.content = document.getElementById('fm-treehole-content').value.trim();
            if (!post.content) { Toast.show('内容不能为空'); return; }
        }

        try {
            await DB.forum.put(post);
            Toast.show('BROADCAST SUCCESS ✦');
            document.getElementById('fm-event-title').value = '';
            document.getElementById('fm-event-desc').value = '';
            document.getElementById('fm-treehole-content').value = '';
            removeEventImg();
            closePanel('fm-compose-panel');
            await loadPosts(false);
            evaluateNewPost(post.id);
        } catch (e) { Toast.show('发送失败'); }
    }

    async function addComment(postId) {
        const input = document.getElementById(`fm-input-${postId}`);
        const text = input.value.trim();
        if (!text) return;
        const post = _posts.find(p => p.id === postId); if (!post) return;
        
        // 捕获是否带有回复对象
        let replyToName = null;
        const replyMatch = text.match(/^回复\s*@([^:]+):\s*(.*)$/);
        if (replyMatch) {
            replyToName = replyMatch[1].trim();
        }

        const now = new Date(), timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        const isAnon = post.type === 'treehole';
        const newComment = { id: 'fc_' + Date.now(), author: isAnon ? 'OBS_0x' : _forumProfile.name, avatarKey: isAnon ? '' : _forumProfile.avatarKey, time: timeStr, text, timestamp: Date.now() };
        post.comments.push(newComment);
        
        try {
            await DB.forum.put(post);
            // 提交完成后清空输入框，并使用无感刷新保持状态
            input.value = ''; 
            await loadPosts(true); 
            
            // 触发群像智能回应
            evaluateUserComment(postId, newComment, replyToName);
        } catch(e) { Toast.show('添加失败'); }
    }

    // 唤起自定义弹窗
    function deletePost(postId) {
        _postToDelete = postId;
        
        // 使用更精准的选择器，确保找对当前的弹窗
        const modal = document.querySelector('#forum-screen #fm-delete-modal');
        const confirmBtn = document.querySelector('#forum-screen #fm-confirm-delete-btn');
        
        if (modal && confirmBtn) {
            modal.classList.add('active');
            confirmBtn.onclick = _executeDelete;
            
            // 顺便加个用户体验升级：点击弹窗外的黑色半透明遮罩，也能取消删除
            modal.onclick = function(e) {
                if (e.target.id === 'fm-delete-modal') cancelDelete();
            };
        } else {
            console.error('[Forum] 弹窗节点丢失，请刷新页面重试');
            Toast.show('系统空间不稳定，请刷新');
        }
    }

    // 关闭弹窗
    function cancelDelete() {
        _postToDelete = null;
        const modal = document.querySelector('#forum-screen #fm-delete-modal');
        if (modal) modal.classList.remove('active');
    }

    // 真正执行删除的逻辑
    async function _executeDelete() {
        if (!_postToDelete) return;
        const postId = _postToDelete;
        cancelDelete(); // 先把弹窗关了

        try {
            const post = _posts.find(p => p.id === postId);
            if (post?.imageKey) await Assets.remove(post.imageKey).catch(()=>{});
            await DB.forum.del(postId); 
            await loadPosts(true); // 使用无损刷新防止影响其他开启的楼层
            Toast.show('RECORD ERASED ✦');
        } catch(e) { 
            Toast.show('删除失败'); 
        }
    }

    function toggleComments(postId) {
        const section = document.getElementById(`fm-comments-${postId}`), btn = document.getElementById(`fm-btn-msg-${postId}`);
        if (section?.classList.contains('expanded')) { section.classList.remove('expanded'); btn.classList.remove('active'); }
        else { section?.classList.add('expanded'); btn?.classList.add('active'); setTimeout(() => document.getElementById(`fm-input-${postId}`)?.focus(), 50); }
    }
    
    // --- 🤖 AI 群像大脑引擎 ---

    async function _getImageDesc(imageKey, activeApi) {
        if (!imageKey) return '';
        try {
            const b64 = await Assets.getBase64(imageKey);
            if (!b64) return '';
            const res = await ApiHelper.chatCompletion(activeApi, [{
                role: 'user',
                content:[
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
                    { type: 'text', text: '用一句话极其简短地描述这张图片的核心画面氛围，不要多余废话。' }
                ]
            }]);
            return res.trim();
        } catch(e) {
            console.warn('[Forum] 图片识别失败', e);
            return '一张未知的图像';
        }
    }

    // 🌟 处理玩家发送评论后的【AI 盖楼与互动推演】
    async function evaluateUserComment(postId, userComment, replyToName) {
        const post = _posts.find(p => p.id === postId);
        if (!post) return;

        const activeApi = await DB.api.getActive().catch(()=>null);
        if (!activeApi) return; 

        const chars = await DB.characters.getAll().catch(()=>[]);
        const charProfiles = chars.map(c => `[ID:${c.id}] 姓名:${c.name} | 人设:${c.persona}`).join('\n');

        const isAnon = post.type === 'treehole';
        const postAuthorText = isAnon ? "匿名者(CLASSIFIED)" : `实名用户(${post.author})`;
        const contentText = post.type === 'event' ? `【标题】${post.title}\n【正文】${post.desc}` : `【内容】${post.content}`;

        const visibleComments = post.comments.filter(c => c.timestamp <= Date.now());
        const contextStr = visibleComments.map(c => `${c.author}: ${c.text}`).join('\n');

        let prompt = `[系统任务：社交平台评论区动态推演]
【背景信息】：
原帖作者：${postAuthorText}
原帖内容：\n${contentText}

【当前评论区历史】：
${contextStr || '暂无'}

【最新动态】：
刚才，玩家本人（网名：${userComment.author}）在评论区发表了最新回复：
"${userComment.text}"
`;

        if (replyToName) {
            prompt += `
【触发强制互动】：玩家明确回复了 @${replyToName} ！
1. 你的首要任务是扮演 ${replyToName} 给玩家进行【直接回复】。
2. 如果 ${replyToName} 是熟人档案中的角色，请【必须】根据角色性格回复玩家（如果不是匿名帖，角色是可以认出玩家的）；如果是路人，请保持路人网感回复。
`;
        }

        prompt += `
【已知熟人档案】：
${charProfiles || '无'}

【你的推演任务】：
1. 必须生成 ${replyToName ? '1条被回复者的回应，可外加 1~2 条吃瓜群众的跟帖' : '1~3 条群像跟帖（熟人或路人均可，视风向而定）'}。
2. 匿名帖(树洞)中大家都不知道玩家真实身份；实名帖中，熟人能够认出玩家。
3. 文风：极度逼真、口语化、年轻人网感，拒绝AI长篇大论说教，单条评论尽量简短。
4. 【重点】如果是回复玩家，请在文本里加上 "回复 @${userComment.author}: " 作为前缀，或者在话语中体现出对玩家的回应。

【返回格式】（必须严格为 JSON，绝不输出其他废话）：
{
  "replies":[
    {
      "author": "发言者名字",
      "text": "具体的评论内容"
    }
  ]
}`;

        try {
            console.log(`[Forum AI] 🧠 开始为玩家跟帖 ${postId} 评估群像反应...`);
            const response = await ApiHelper.chatCompletion(activeApi,[{ role: 'system', content: prompt }]);
            
            const cleaned = response.replace(/```json|```/g, '').trim();
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start === -1 || end === -1) throw new Error('JSON 解析失败');
            const result = JSON.parse(cleaned.substring(start, end + 1));

            const newComments =[];
            const now = Date.now();

            if (result.replies && Array.isArray(result.replies)) {
                let delayAcc = 0;
                for (const rep of result.replies) {
                    if (!rep.author || !rep.text) continue;
                    const char = chars.find(c => c.name === rep.author);
                    let avatarKey = char ? `char-avatar-${char.id}` : ''; // 是系统角色就分配专有头像
                    
                    delayAcc += Math.floor(Math.random() * 8000) + 5000; // 5 ~ 13 秒的时间错峰，呈现真实打字涌入感
                    newComments.push({
                        id: 'fc_' + Math.random().toString(36).substr(2, 9),
                        author: rep.author,
                        avatarKey: avatarKey,
                        text: rep.text,
                        timestamp: now + delayAcc
                    });
                }
            }

            if (newComments.length > 0) {
                newComments.forEach(c => {
                    const d = new Date(c.timestamp);
                    c.time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
                });
                post.comments = [...(post.comments || []), ...newComments];
                await DB.forum.put(post);
                console.log(`[Forum AI] 🎯 预埋了 ${newComments.length} 条针对玩家的盖楼回复！`);
            }
        } catch(e) {
            console.error('[Forum AI] 玩家跟帖评估失败', e);
        }
    }

    async function evaluateNewPost(postId) {
        const post = _posts.find(p => p.id === postId);
        if (!post) return;

        const activeApi = await DB.api.getActive().catch(()=>null);
        if (!activeApi) return;

        let imgDesc = '';
        if (post.type === 'event' && post.imageKey) {
            imgDesc = await _getImageDesc(post.imageKey, activeApi);
        }

        const chars = await DB.characters.getAll().catch(()=>[]);
        const charProfiles = chars.map(c => `[ID:${c.id}] 姓名:${c.name} | 人设:${c.persona}`).join('\n');

        const isAnon = post.type === 'treehole';
        const authorText = isAnon ? "一位匿名者(CLASSIFIED)" : `实名用户(${post.author})`;
        const contentText = post.type === 'event' ? `【标题】${post.title}\n【正文】${post.desc}` : `【内容】${post.content}`;

        const prompt = `[系统任务：真实社交平台群像回帖模拟]
【事件背景】：
发帖人：${authorText}
帖子内容：\n${contentText}
${imgDesc ? `【附带图片画面描述】：${imgDesc}` : ''}

【已知熟人档案】：
${charProfiles || '无'}

【你的推演任务】：
1. 熟人反应：基于性格判断是否跟帖。如果不感兴趣，请输出 "[IGNORE]"。如果是匿名树洞，熟人仅凭内容判断；如果是实名事件，熟人知道是用户发的。
2. 路人涌入：生成 8-10 条路人（NPC）跟帖。
3. 路人名字要求：【必须像真实的网友ID】！例如：momo、已注销、熬夜冠军、西瓜碎碎冰、User_9527、J、无语子、睡不醒的猫 等等。混合中文、英文、数字，绝对不要全是一本正经的代号。
4. 路人文风要求：【极度逼真的活人感】！
   - 使用现代网络口语、年轻人冲浪习惯（如：绝了、蹲、拔草、笑死、yyds、太真实了、抱抱、吃瓜等）。
   - 允许出现错别字、标点省略。
   - 性格要多样：有理中客、有阴阳怪气挑刺的、有单纯发癫的、有暖心安慰的、还有彻底跑题歪楼的。
   - 【绝对警告】：严禁书面语、严禁大段说教、严禁像AI一样总结陈词。每条评论最好控制在1-2句话！

【返回格式】（必须严格为 JSON，绝不输出其他废话）：
{
  "chars": { "熟人ID": "评论内容", "熟人ID": "[IGNORE]" },
  "npcs":[
     { "name": "路人ID", "text": "评论内容" }
  ]
}`;

        try {
            console.log(`[Forum AI] 🧠 开始为帖子 ${postId} 评估群像反应...`);
            const response = await ApiHelper.chatCompletion(activeApi,[{ role: 'system', content: prompt }]);
            
            const cleaned = response.replace(/```json|```/g, '').trim();
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start === -1 || end === -1) throw new Error('JSON 解析失败');
            const result = JSON.parse(cleaned.substring(start, end + 1));

            const newComments =[];
            const now = Date.now();

            if (result.chars) {
                for (const [cid, text] of Object.entries(result.chars)) {
                    if (text && !text.includes('[IGNORE]')) {
                        const char = chars.find(c => String(c.id) === cid);
                        if (char) {
                            newComments.push({
                                id: 'fc_' + Math.random().toString(36).substr(2, 9),
                                author: char.name,
                                avatarKey: `char-avatar-${char.id}`,
                                text: text,
                                timestamp: now + Math.floor(Math.random() * 80000) + 10000
                            });
                        }
                    }
                }
            }

            if (result.npcs) {
                for (const npc of result.npcs) {
                    newComments.push({
                        id: 'fc_' + Math.random().toString(36).substr(2, 9),
                        author: npc.name || 'Anonymous',
                        avatarKey: '', 
                        text: npc.text,
                        timestamp: now + Math.floor(Math.random() * 105000) + 5000
                    });
                }
            }

            newComments.sort((a, b) => a.timestamp - b.timestamp);
            newComments.forEach(c => {
                const d = new Date(c.timestamp);
                c.time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            });

            post.comments =[...(post.comments || []), ...newComments];
            await DB.forum.put(post);
            console.log(`[Forum AI] 🎯 成功预埋了 ${newComments.length} 条时空错峰评论！`);
            
        } catch(e) {
            console.error('[Forum AI] 评估失败', e);
        }
    }

    async function loadMoreComments(postId) {
        const post = _posts.find(p => p.id === postId);
        if (!post) return;

        const btn = document.getElementById(`fm-load-more-${postId}`);
        if (btn) { btn.textContent = '[ DECRYPTING LOGS... ]'; btn.style.pointerEvents = 'none'; }

        const activeApi = await DB.api.getActive().catch(()=>null);
        if (!activeApi) { 
            if (btn) { btn.textContent = '[ NETWORK OFFLINE ]'; }
            return; 
        }

        const visibleComments = post.comments.filter(c => c.timestamp <= Date.now());
        const contextStr = visibleComments.map(c => `${c.author}: ${c.text}`).join('\n');
        const contentText = post.type === 'event' ? `【标题】${post.title}\n【正文】${post.desc}` : `【内容】${post.content}`;

        const prompt = `[系统任务：真实社交平台路人跟帖模拟]
发帖内容：\n${contentText}
目前已有的评论区上下文：\n${contextStr || '暂无评论'}

【你的任务】：
请根据当前真实网友“冲浪”的随性氛围，以及目前的评论区风向，再生成 5-8 条全新的路人跟帖。

【核心要求】：
1. 路人名字：继续保持真实网感（如：momo、小狗碎碎念、User_112、今天也不想上班、K 等）。
2. 跟帖逻辑：可以是跟风玩梗、可以反驳楼上观点、可以吃瓜打卡、也可以彻底歪楼。
3. 语气：【拒绝AI味】，短平快，不加过多修饰，就像真人在手机上随手敲出来的字。

【返回格式】（严格 JSON，绝不输出其他废话）：
{
  "npcs":[
     { "name": "路人ID", "text": "评论内容" }
  ]
}`;

        try {
            const response = await ApiHelper.chatCompletion(activeApi, [{ role: 'system', content: prompt }]);
            const cleaned = response.replace(/```json|```/g, '').trim();
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            const result = JSON.parse(cleaned.substring(start, end + 1));

            const now = Date.now();
            const newComments =[];
            if (result.npcs) {
                for (const npc of result.npcs) {
                    newComments.push({
                        id: 'fc_' + Math.random().toString(36).substr(2, 9),
                        author: npc.name || 'Anonymous',
                        avatarKey: '',
                        text: npc.text,
                        timestamp: now + Math.floor(Math.random() * 40000) + 5000
                    });
                }
            }

            newComments.sort((a, b) => a.timestamp - b.timestamp);
            newComments.forEach(c => {
                const d = new Date(c.timestamp);
                c.time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            });

            post.comments = [...(post.comments || []), ...newComments];
            await DB.forum.put(post);
            
            if(typeof Toast !== 'undefined') Toast.show('网络波动，拦截到新信号 ✦');
            await loadPosts(true); // 刷新UI时同样保持状态无损

        } catch(e) {
            console.error('[Forum AI] Load More 失败', e);
            if (btn) { btn.textContent = '[ DECRYPTION FAILED ]'; }
        }
    }

    function openPanel(id) { document.getElementById(id).classList.add('active'); }
    function closePanel(id) { document.getElementById(id).classList.remove('active'); }
    function switchComposeType(type, el) {
        document.querySelectorAll('#forum-screen .seg-btn').forEach(btn => btn.classList.remove('active'));
        el.classList.add('active');
        document.getElementById('fm-form-event-area').style.display = type === 'event' ? 'block' : 'none';
        document.getElementById('fm-form-treehole-area').style.display = type === 'treehole' ? 'block' : 'none';
    }
    function _escHtml(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>'); }
    function _formatDate(ts) { const d = new Date(ts), pad = n => String(n).padStart(2, '0'); return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }

    // 增加一个跳转分类的方法
    function switchTo(type) {
        const pills = document.querySelectorAll('#forum-screen .filter-pill');
        pills.forEach(p => p.classList.remove('active'));
        const target = Array.from(pills).find(p => p.innerText.includes(type === 'treehole' ? '树洞' : '广场'));
        if (target) target.classList.add('active');
        _filterAndRender(type, false);
    }

    // 更新 return 暴露
    return { init, onEnter, filterFeed, switchTo, evaluateNewPost, toggleComments, addComment, prepareReply, openPanel, closePanel, switchComposeType, publishPost, deletePost, cancelDelete, changeForumAvatar, updateForumName, onEventImgSelected, removeEventImg,loadMoreComments };
})();