/**
 * ============================================================
 * DiaryModule — 角色日记 / 档案名录 (独立插件)
 * ============================================================
 */
const DiaryModule = (() => {
    let _isInit = false;
    let _observer = null;

    // 1. 注入专属 CSS (作用域限制在 #diary-screen 内部)
    function _injectStyles() {
        const style = document.createElement('style');
        style.id = 'diary-module-styles';
        style.textContent = `
            #diary-screen {
                position: absolute; inset: 0; z-index: 155;
                background-color: #030303; color: #FFFFFF;
                font-family: 'Inter', 'Noto Sans SC', sans-serif;
                transform: translateX(100%);
                transition: transform 0.42s cubic-bezier(0.19,1,0.22,1);
                overflow: hidden;
                -webkit-font-smoothing: antialiased;
            }
            #diary-screen.active { transform: translateX(0); }

            #diary-screen .font-serif-eng { font-family: 'Playfair Display', serif; }
            
            #diary-screen .micro-bilingual {
                font-size: 0.55rem; letter-spacing: 0.15em; text-transform: uppercase;
                color: #8A8A8A; display: flex; flex-direction: column; gap: 2px; line-height: 1.1;
            }
            #diary-screen .micro-bilingual .cn { font-size: 0.6rem; letter-spacing: 0.2em; font-weight: 300; }

            /* 顶部导航 */
            #diary-screen .site-header {
                position: absolute; top: 0; left: 0; width: 100%;
                padding: max(env(safe-area-inset-top, 20px), 20px) 20px 20px;
                z-index: 50; display: flex; justify-content: space-between; align-items: flex-start;
                mix-blend-mode: difference; pointer-events: none;
            }
            #diary-screen .btn-back {
                pointer-events: auto; display: flex; align-items: center; gap: 8px;
                transition: opacity 0.3s ease; background: none; border: none; cursor: pointer; outline: none;
            }
            #diary-screen .btn-back:active { opacity: 0.5; transform: scale(0.95); }
            #diary-screen .btn-icon {
                width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.4);
                display: flex; align-items: center; justify-content: center;
            }
            #diary-screen .btn-icon i { font-size: 14px; color: white; }
            #diary-screen .header-label { text-align: right; align-items: flex-end; }

            /* 滚动容器与幻灯片 */
            #diary-screen .directory-container {
                height: 100%; width: 100%; overflow-y: auto; overflow-x: hidden;
                scroll-snap-type: y mandatory; scrollbar-width: none;
            }
            #diary-screen .directory-container::-webkit-scrollbar { display: none; }

            #diary-screen .character-slide {
                height: 100%; width: 100%; scroll-snap-align: start; position: relative;
                display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 6vh;
            }

            /* 视觉层 */
            #diary-screen .visual-layer { position: absolute; top: 0; left: 0; width: 100%; height: 75%; z-index: 0; }
            #diary-screen .visual-layer img { width: 100%; height: 100%; object-fit: cover; object-position: top center; filter: brightness(0.9) contrast(1.05); }
            #diary-screen .fade-to-black {
                position: absolute; inset: 0;
                background: linear-gradient(to bottom, rgba(3,3,3,0) 0%, rgba(3,3,3,0.1) 40%, rgba(3,3,3,0.85) 75%, rgba(3,3,3,1) 100%);
            }

            /* 交互层 */
            #diary-screen .ui-layer {
                position: relative; z-index: 10; padding: 0 24px; opacity: 0; transform: translateY(20px);
                transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            #diary-screen .character-slide.active .ui-layer { opacity: 1; transform: translateY(0); }

            /* 排版 */
            #diary-screen .char-id-row { display: flex; align-items: flex-end; gap: 12px; margin-bottom: 8px; }
            #diary-screen .char-no { font-style: italic; font-size: 1.5rem; color: rgba(255, 255, 255, 0.3); }
            #diary-screen .identity-label { margin-bottom: 4px; }
            #diary-screen .identity-label .cn { color: rgba(255, 255, 255, 0.5); }

            #diary-screen .char-name-row { font-size: 3rem; letter-spacing: -0.025em; margin-bottom: 32px; display: flex; align-items: baseline; gap: 16px; }
            #diary-screen .char-name-en { color: white; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
            #diary-screen .char-name-cn { font-size: 1.5rem; font-weight: 300; color: #D1D5DB; letter-spacing: 0.1em; font-family: 'Inter', 'Noto Sans SC', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }

            /* 身份卡片 */
            #diary-screen .identity-card {
                border-top: 1px solid rgba(255, 255, 255, 0.4); border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                padding: 24px 0; display: flex; flex-direction: column; gap: 24px; position: relative;
            }
            #diary-screen .identity-card::before {
                content: ''; position: absolute; top: -1px; left: 0; width: 0; height: 1px;
                background-color: #FFF; transition: width 1s ease 0.3s;
            }
            #diary-screen .character-slide.active .identity-card::before { width: 40%; }

            #diary-screen .tagline-container { margin-bottom: 16px; }
            #diary-screen .tagline-en { font-size: 0.7rem; color: #9CA3AF; font-weight: 300; letter-spacing: 0.025em; margin-bottom: 4px; }
            #diary-screen .tagline-cn { font-size: 0.7rem; color: #6B7280; font-weight: 300; letter-spacing: 0.1em; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

            /* 数据与按钮 */
            #diary-screen .stats-grid { display: flex; justify-content: space-between; align-items: flex-end; }
            #diary-screen .stats-group { display: flex; gap: 32px; }
            #diary-screen .stat-item .cn { color: rgba(255, 255, 255, 0.6); }
            #diary-screen .stat-val-en { font-size: 1.25rem; color: white; margin-top: 4px; font-style: italic; }
            #diary-screen .stat-val-date { font-size: 0.8rem; color: white; margin-top: 8px; }

            #diary-screen .enter-btn {
                pointer-events: auto; display: inline-flex; align-items: center; justify-content: space-between;
                background: rgba(255, 255, 255, 0.05); border: 0.5px solid rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                border-radius: 100px; padding: 8px 16px 8px 20px; transition: all 0.3s ease; cursor: pointer;
            }
            #diary-screen .enter-btn:active { background: rgba(255, 255, 255, 0.2); transform: scale(0.95); }
            #diary-screen .enter-btn-labels { text-align: left; margin-right: 24px; }
            #diary-screen .enter-btn-labels span { color: white; }
            #diary-screen .enter-btn-labels .en { font-size: 0.5rem; }
            #diary-screen .enter-btn-icon {
                width: 32px; height: 32px; border-radius: 50%; background-color: white; color: black;
                display: flex; align-items: center; justify-content: center;
            }

            /* 滑动提示 */
            #diary-screen .swipe-hint {
                position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%);
                display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.3;
            }
            #diary-screen .swipe-text { font-size: 0.45rem; text-align: center; }
            #diary-screen .swipe-line { width: 1px; height: 12px; background-color: white; }
            
            #diary-screen .empty-state {
                position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                font-family: 'Space Mono', monospace; font-size: 0.7rem; color: #666; letter-spacing: 2px; text-transform: uppercase;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. 注入 HTML 骨架
    function _injectDOM() {
        const device = document.querySelector('.device');
        if (!device || document.getElementById('diary-screen')) return;

        const screen = document.createElement('div');
        screen.id = 'diary-screen';
        screen.className = 'screen';
        
        screen.innerHTML = `
            <header class="site-header">
                <button class="btn-back" onclick="DiaryModule.close()">
                    <div class="btn-icon"><i class="ph ph-caret-left"></i></div>
                    <div class="micro-bilingual" style="text-align: left;">
                        <span style="color: rgba(255,255,255,1);">BACK</span>
                        <span class="cn" style="color: rgba(255,255,255,0.8);">返回桌面</span>
                    </div>
                </button>
                <div class="micro-bilingual header-label">
                    <span style="color: rgba(255,255,255,1);">DIRECTORY</span>
                    <span class="cn" style="color: rgba(255,255,255,0.8);">角色档案</span>
                </div>
            </header>
            <main class="directory-container" id="diary-directory-list"></main>
        `;
        device.appendChild(screen);
    }

    // 3. 格式化时间 (YYYY.MM.DD)
    function _formatDate(ts) {
        if (!ts) return '----.--.--';
        const d = new Date(ts);
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
    }

    // 4. 渲染数据列表
    async function _renderList() {
        const container = document.getElementById('diary-directory-list');
        container.innerHTML = '';

        try {
            // 获取所有角色
            const chars = await DB.characters.getAll();
            
            if (chars.length === 0) {
                container.innerHTML = `<div class="empty-state">No Characters Found</div>`;
                return;
            }

            // 遍历渲染
            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                const num = String(i + 1).padStart(2, '0');
                
                // 异步获取头像
                let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80';
                if (char.avatarUrl) {
                    avatarUrl = await Assets.getUrl(char.avatarUrl).catch(() => avatarUrl) || avatarUrl;
                }

                // 计算收录篇章 (取该角色的消息总数)
                const totalEntries = await DB.messages.countByChar(String(char.id)).catch(() => 0);
                
                // 获取最后同步时间 (如果有聊天记录取最新，没有则取最后互动)
                let lastSyncTs = await DB.settings.get(`last-interaction-${char.id}`).catch(() => 0);
                const lastMsgs = await DB.messages.getPage(String(char.id), 0, 1).catch(() =>[]);
                if (lastMsgs.length > 0) lastSyncTs = Math.max(lastSyncTs, lastMsgs[0].timestamp);

                const section = document.createElement('section');
                section.className = 'character-slide';
                section.innerHTML = `
                    <div class="visual-layer">
                        <img src="${avatarUrl}" alt="${char.name}">
                        <div class="fade-to-black"></div>
                    </div>
                    <div class="ui-layer">
                        <div class="char-id-row">
                            <span class="font-serif-eng char-no">No.${num}</span>
                            <div class="micro-bilingual identity-label">
                                <span>AUTHOR IDENTITY</span>
                                <span class="cn">记录对象</span>
                            </div>
                        </div>
                        <h1 class="font-serif-eng char-name-row">
                            <span class="char-name-en">${char.title || char.name}</span>
                            <span class="char-name-cn">${char.title ? char.name : ''}</span>
                        </h1>
                        <div class="identity-card">
                            <div class="tagline-container">
                                <p class="tagline-en">${char.mbti ? 'ARCHETYPE: ' + char.mbti : 'OBSERVER'}</p>
                                <p class="tagline-cn">${char.persona ? char.persona : '档案正在收集中...'}</p>
                            </div>
                            <div class="stats-grid">
                                <div class="stats-group">
                                    <div class="micro-bilingual stat-item">
                                        <span>ENTRIES</span>
                                        <span class="cn">收录记录</span>
                                        <span class="font-serif-eng stat-val-en">${totalEntries}</span>
                                    </div>
                                    <div class="micro-bilingual stat-item">
                                        <span>LAST SYNC</span>
                                        <span class="cn">最后同步</span>
                                        <span class="font-serif-eng stat-val-date">${_formatDate(lastSyncTs)}</span>
                                    </div>
                                </div>
                                <button class="enter-btn" onclick="DiaryModule.openArchive('${char.id}')">
                                    <div class="micro-bilingual enter-btn-labels">
                                        <span class="en">OPEN ARCHIVE</span>
                                        <span class="cn">翻阅日记</span>
                                    </div>
                                    <div class="enter-btn-icon"><i class="ph-bold ph-arrow-right"></i></div>
                                </button>
                            </div>
                        </div>
                        <div class="swipe-hint">
                            <div class="micro-bilingual" style="align-items: center;"><span class="swipe-text">SWIPE</span></div>
                            <div class="swipe-line"></div>
                        </div>
                    </div>
                `;
                container.appendChild(section);
            }

            // 设置滚动监听 (实现文字滑出动画)
            _setupObserver();

        } catch (e) {
            console.error('[DiaryModule] render error:', e);
            container.innerHTML = `<div class="empty-state">Data Error</div>`;
        }
    }

    function _setupObserver() {
        if (_observer) _observer.disconnect();
        
        const slides = document.querySelectorAll('#diary-screen .character-slide');
        if (slides.length > 0) setTimeout(() => slides[0].classList.add('active'), 100);

        _observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, { threshold: 0.4 });

        slides.forEach(slide => _observer.observe(slide));
    }

    // ==========================================
    // 暴露的公共方法
    // ==========================================
    async function init() {
        if (_isInit) return;
        _injectStyles();
        _injectDOM();
        _isInit = true;
    }

    async function open() {
        if (!_isInit) await init();
        await _renderList();
        document.getElementById('diary-screen').classList.add('active');
    }

    function close() {
        document.getElementById('diary-screen').classList.remove('active');
    }

    function openArchive(charId) {
        // 占位函数：下一阶段我们将在这里展开该角色的具体日记列表
        Toast.show(`正在构建 ${charId} 的日记本... 敬请期待！`);
        console.log(`[DiaryModule] Request to open diary for charId: ${charId}`);
    }

    return { init, open, close, openArchive };
})();

// 挂载到全局
window.DiaryModule = DiaryModule;