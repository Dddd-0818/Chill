'use strict';

// ============================================================
// LifestyleModule — 角色行程与生活系统 (动态时空推演版)
// ============================================================
const LifestyleModule = (() => {
    let _initialized = false;
    let _chars =[];
    let _currentDetailCharId = null;
    let _currentWeekData =[];
    let _selectedDateIndex = 0;
    
    // UI 内部状态
    let _activeItiId = null; // 当前展开的行程卡片ID
    let _syncedItiIds =[];  // 已经同步到聊天的行程ID
    let _currentSchedule = null; // 当前正在查看的完整行程数据实例

    function init() {
        if (_initialized) return;

        const style = document.createElement('style');
        style.innerHTML = `
            #lifestyle-screen {
                --bg-deep: #030303;     
                --card-bg: #111111;     
                --text-main: #fcfcfc;
                --text-sub: #888888;
                --divider: rgba(255, 255, 255, 0.08);
                --accent: #ffffff;
                background-color: var(--bg-deep);
                color: var(--text-main);
                z-index: 150; 
                overflow: hidden;
            }

            /* --- 公共背景 --- */
            #lifestyle-screen .ambient-bg {
                position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;
                background-image: 
                    radial-gradient(circle at 15% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 40%),
                    radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 30%);
            }
            #lifestyle-screen .grid-overlay {
                position: absolute; inset: 0; width: 100%; height: 100%;
                background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                background-size: 40px 40px; mask-image: linear-gradient(to bottom, black 20%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
            }

            /* --- 视图切换机制 --- */
            .ls-view {
                position: absolute; inset: 0; width: 100%; height: 100%;
                transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.4s ease;
                overflow-y: auto; overflow-x: hidden; scrollbar-width: none;
            }
            .ls-view::-webkit-scrollbar { display: none; }
            
            #ls-listView { z-index: 10; }
            #ls-detailView { z-index: 20; transform: translateX(100%); background: #F4F4F6; color: #111111; font-family: 'Inter', 'Noto Sans SC', sans-serif; }
            #ls-detailView.active { transform: translateX(0); }

            /* 新增：第三层视图 - 具体动线页 (Itinerary Log) */
            #ls-itineraryView { z-index: 30; transform: translateX(100%); background: #F4F4F6; color: #111111; font-family: 'Inter', 'Noto Sans SC', sans-serif; }
            #ls-itineraryView.active { transform: translateX(0); }

            /* =========================================
               List View 列表页样式 
               ========================================= */
            #ls-listView .top-nav {
                position: sticky; top: 0; width: 100%; padding: max(env(safe-area-inset-top, 20px), 24px) 20px 16px; z-index: 100;
                background: linear-gradient(to bottom, rgba(3,3,3,0.9) 0%, rgba(3,3,3,0.6) 60%, transparent 100%);
                backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; justify-content: space-between; align-items: center;
            }
            #ls-listView .back-btn { background: transparent; border: none; color: var(--text-main); font-size: 15px; font-weight: 300; letter-spacing: 0.5px; cursor: pointer; position: relative; padding-bottom: 4px; font-family: inherit; }
            #ls-listView .back-btn::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px; background-color: var(--accent); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: left; }
            #ls-listView .back-btn:active::after { transform: scaleX(0.3); }
            #ls-listView .nav-decor { display: flex; align-items: center; gap: 8px; font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 2px; color: var(--text-sub); text-transform: uppercase; }
            #ls-listView .decor-line { width: 20px; height: 1px; background-color: var(--divider); }
            #ls-listView .list-container { padding: 20px 20px 60px; display: flex; flex-direction: column; gap: 28px; }
            #ls-listView .ls-card {
                background-color: var(--card-bg); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); cursor: pointer;
                transform: translateY(40px) scale(0.98); opacity: 0; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease, box-shadow 0.3s ease;
            }
            #ls-listView .ls-card.in-view { transform: translateY(0) scale(1); opacity: 1; }
            #ls-listView .ls-card:active { transform: scale(0.96) !important; box-shadow: 0 10px 20px rgba(0,0,0,0.8); border-color: rgba(255, 255, 255, 0.1); }
            #ls-listView .card-img-wrap { position: relative; width: 100%; height: 320px; overflow: hidden; background: #1a1a1a; }
            #ls-listView .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            #ls-listView .ls-card:active .card-img { transform: scale(1.05); }
            #ls-listView .card-img-gradient { position: absolute; bottom: 0; left: 0; width: 100%; height: 55%; background: linear-gradient(to top, var(--card-bg) 0%, transparent 100%); pointer-events: none; }
            #ls-listView .card-content { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 20px; position: relative; z-index: 10; }
            #ls-listView .content-main { display: flex; justify-content: space-between; align-items: flex-end; margin-top: -16px; }
            #ls-listView .info-left { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; padding-right: 16px; }
            #ls-listView .char-title { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 26px; font-weight: 600; font-style: italic; color: var(--text-main); letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; margin: 0; }
            #ls-listView .char-desc { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--text-sub); line-height: 1.5; letter-spacing: 1px; text-transform: uppercase; }
            #ls-listView .stats-right { display: flex; gap: 16px; text-align: center; flex-shrink: 0; }
            #ls-listView .stat-item { display: flex; flex-direction: column; gap: 4px; }
            #ls-listView .stat-val { font-size: 15px; color: var(--text-main); font-weight: 300; font-family: 'Space Mono', monospace; }
            #ls-listView .stat-label { font-size: 9px; color: var(--text-sub); letter-spacing: 1px; text-transform: uppercase; }
            #ls-listView .stat-divider { width: 1px; background-color: var(--divider); height: 30px; align-self: center; }
            #ls-listView .hr-line { height: 1px; background-color: var(--divider); border: none; width: 100%; }
            #ls-listView .content-footer { display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--text-sub); letter-spacing: 1px; font-family: 'Space Mono', monospace; text-transform: uppercase; }
            #ls-listView .footer-author span { color: #ccc; }
            #ls-listView .page-end { text-align: center; padding: 20px 0 40px; font-size: 10px; letter-spacing: 4px; color: #444; font-family: 'Space Mono', monospace; text-transform: uppercase; }

            /* =========================================
               Detail View 行程总览页 
               ========================================= */
            .ls-texture-overlay { position: absolute; inset: 0; z-index: 20; opacity: 0.04; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); pointer-events: none; mix-blend-mode: multiply; }
            .ls-detail-nav { position: absolute; top: 0; left: 0; width: 100%; padding: max(env(safe-area-inset-top, 24px), 24px) 24px 24px; z-index: 50; display: flex; justify-content: space-between; align-items: flex-start; background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%); }
            .ls-nav-btn-back { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 2px; color: #fff; transition: all 0.4s ease; }
            .ls-nav-btn-back:hover { transform: translateX(-4px); }
            .ls-nav-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
            .ls-nav-id { font-family: 'Space Mono', monospace; font-size: 10px; color: #fff; letter-spacing: 2px; text-transform: uppercase;}
            .ls-nav-status { display: flex; align-items: center; gap: 4px; font-family: 'Space Mono', monospace; font-size: 8px; color: rgba(255,255,255,0.6); letter-spacing: 1px; }
            .ls-nav-status::before { content: ''; width: 4px; height: 4px; background: #fff; border-radius: 50%; animation: ls-pulse 2s infinite; }
            @keyframes ls-pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }

            .ls-hero-section { position: relative; height: 55vh; width: 100%; overflow: hidden; }
            .ls-parallax-image { position: absolute; top: 0; left: 0; width: 100%; height: 130%; object-fit: cover; filter: contrast(105%) brightness(0.85); transform-origin: center; transition: transform 0.1s cubic-bezier(0.1, 0.5, 0.9, 0.5); }
            .ls-hero-cut { position: absolute; bottom: 0; left: 0; width: 100%; height: 80px; background: linear-gradient(to top, #F4F4F6 0%, rgba(244,244,246,0) 100%); }

            .ls-temporal-axis-wrapper { position: relative; margin-top: -40px; z-index: 30; padding: 0 16px; }
            .ls-axis-glass { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); padding: 16px 12px; }
            .ls-axis-track { display: flex; justify-content: space-between; align-items: center; position: relative; }
            .ls-axis-track::before { content: ''; position: absolute; left: 10px; right: 10px; top: 50%; transform: translateY(-50%); height: 1px; background: rgba(0,0,0,0.06); z-index: 0; }
            .ls-axis-node { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; padding: 4px; transition: all 0.3s ease; }
            .ls-node-day { font-family: 'Space Mono', monospace; font-size: 8px; color: #888; letter-spacing: 1px; transition: color 0.3s; }
            .ls-node-dot { width: 8px; height: 8px; border-radius: 50%; background: #FAFAFC; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; transition: all 0.4s ease; }
            .ls-node-dot.has-anomaly::after { content: ''; width: 4px; height: 4px; background: #D93A3A; border-radius: 50%; }
            .ls-node-date { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 500; color: #aaa; line-height: 1; transition: color 0.3s; }
            .ls-axis-node.is-selected .ls-node-day { color: #111; font-weight: 700; }
            .ls-axis-node.is-selected .ls-node-date { color: #111; transform: scale(1.2); }
            .ls-axis-node.is-selected .ls-node-dot { background: #111; border-color: #111; box-shadow: 0 0 0 3px rgba(17,17,17,0.1); }
            .ls-axis-node.is-selected .ls-node-dot.has-anomaly::after { background: #fff; } 

            .ls-briefing-section { padding: 32px 24px 100px 24px; position: relative; z-index: 10; }
            .ls-bg-watermark { position: absolute; top: 0; left: 10px; font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 120px; font-weight: 600; color: rgba(0,0,0,0.03); letter-spacing: -4px; z-index: -1; pointer-events: none; user-select: none; }
            .ls-briefing-content { transition: opacity 0.4s ease, transform 0.4s ease; }
            .ls-briefing-content.is-animating { opacity: 0; transform: translateY(10px); }

            .ls-brief-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 16px; }
            .ls-brief-title-wrap { display: flex; flex-direction: column; gap: 4px; }
            .ls-brief-label { font-family: 'Space Mono', monospace; font-size: 9px; color: #888; letter-spacing: 2px; text-transform: uppercase; }
            .ls-brief-date { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; color: #111; line-height: 1; letter-spacing: -1px; text-transform: uppercase;}
            .ls-brief-status { font-family: 'Space Mono', monospace; font-size: 9px; padding: 4px 8px; border: 1px solid #111; border-radius: 20px; color: #111; letter-spacing: 1px; }

            .ls-brief-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
            .ls-data-block { display: flex; flex-direction: column; gap: 6px; }
            .ls-data-key { font-family: 'Space Mono', monospace; font-size: 9px; color: #888; letter-spacing: 1.5px; text-transform: uppercase; }
            .ls-data-val { font-size: 15px; font-weight: 400; color: #111; }
            .ls-data-val strong { font-family: 'Space Mono', monospace; font-size: 18px; font-weight: 700; }

            .ls-anomaly-module { display: none; margin-bottom: 32px; position: relative; padding-left: 16px; }
            .ls-anomaly-module::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #D93A3A; }
            .ls-anomaly-tag { font-family: 'Space Mono', monospace; font-size: 9px; color: #D93A3A; letter-spacing: 1px; margin-bottom: 6px; display: block; }
            .ls-anomaly-text { font-size: 13px; color: #444; font-weight: 300; line-height: 1.6; }

            .ls-actions-group { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
            .ls-enter-action { display: flex; justify-content: space-between; align-items: center; width: 100%; background: none; border: none; cursor: pointer; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1); transition: all 0.3s ease; }
            .ls-enter-action:hover { border-bottom-color: #111; }
            .ls-enter-action:active { transform: scale(0.98); }
            .ls-action-text { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #111; }
            .ls-action-arrow { color: #111; font-size: 18px; transition: transform 0.4s ease; }
            .ls-enter-action:hover .ls-action-arrow { transform: translateX(6px); }

            .ls-config-action { display: flex; justify-content: space-between; align-items: center; width: 100%; background: none; border: none; cursor: pointer; padding: 12px 0; transition: all 0.3s ease; opacity: 0.6; }
            .ls-config-action:hover { opacity: 1; }
            .ls-config-action:active { transform: scale(0.98); }
            .ls-config-text { font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 2px; color: #111; }

            .ls-enter-action.is-disabled { cursor: default; border-bottom-color: rgba(0,0,0,0.05); }
            .ls-enter-action.is-disabled .ls-action-text { color: #aaa; }
            .ls-enter-action.is-disabled .ls-action-arrow { opacity: 0; }

            /* 空状态阻断 */
            .ls-empty-state-overlay {
                position: absolute; inset: 0; z-index: 40;
                background: rgba(244, 244, 246, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 32px; text-align: center; opacity: 0; pointer-events: none; transition: opacity 0.5s ease;
            }
            .ls-empty-state-overlay.active { opacity: 1; pointer-events: auto; }
            .ls-empty-icon { font-size: 40px; color: #111; margin-bottom: 16px; opacity: 0.8; }
            .ls-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #111; margin-bottom: 8px; line-height: 1.2; }
            .ls-empty-desc { font-size: 12px; color: #666; margin-bottom: 32px; line-height: 1.6; }
            .ls-init-btn {
                background: #111; color: #fff; border: none; padding: 14px 28px; border-radius: 4px;
                font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px;
                text-transform: uppercase; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                transition: transform 0.2s, background 0.2s; display: flex; align-items: center; gap: 8px;
            }
            .ls-init-btn:active { transform: scale(0.95); background: #333; }

            /* =========================================
               Routine Config 面板样式
               ========================================= */
            .ls-modal-overlay {
                position: absolute; inset: 0; z-index: 500; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px);
                opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
            }
            .ls-modal-overlay.active { opacity: 1; pointer-events: auto; }
            .ls-modal-sheet {
                position: absolute; bottom: 0; left: 0; width: 100%; max-height: 85vh;
                background: #F4F4F6; color: #111; border-radius: 24px 24px 0 0;
                transform: translateY(100%); transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
            }
            .ls-modal-overlay.active .ls-modal-sheet { transform: translateY(0); }
            
            .ls-modal-header { padding: 24px 24px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.08); }
            .ls-modal-title { font-family: 'Space Mono', monospace; font-size: 12px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; }
            .ls-modal-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #111; }
            
            .ls-modal-body { padding: 24px; overflow-y: auto; flex: 1; scrollbar-width: none; }
            .ls-modal-body::-webkit-scrollbar { display: none; }
            
            .ls-routine-meta { display: flex; gap: 16px; margin-bottom: 24px; }
            .ls-meta-box { flex: 1; background: #fff; padding: 16px; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; }
            .ls-meta-label { font-family: 'Space Mono', monospace; font-size: 9px; color: #888; letter-spacing: 1px; margin-bottom: 8px; display: block; text-transform: uppercase;}
            .ls-meta-val { font-size: 16px; font-weight: 500; font-family: 'Space Mono', monospace; color: #111; }
            
            .ls-routine-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
            .ls-rt-tag { background: #111; color: #fff; font-family: 'Space Mono', monospace; font-size: 9px; padding: 4px 10px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase;}
            
            .ls-routine-timeline { display: flex; flex-direction: column; position: relative; padding-left: 20px; }
            .ls-routine-timeline::before { content: ''; position: absolute; left: 4px; top: 8px; bottom: 0; width: 1px; background: rgba(0,0,0,0.1); }
            .ls-rt-event { position: relative; margin-bottom: 24px; }
            .ls-rt-event::before { content: ''; position: absolute; left: -20px; top: 6px; width: 9px; height: 9px; border-radius: 50%; background: #F4F4F6; border: 2px solid #111; }
            .ls-rt-time { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: #111; margin-bottom: 4px; }
            .ls-rt-title { font-family: 'Noto Serif SC', serif; font-size: 15px; font-weight: 600; color: #111; margin-bottom: 4px; }
            .ls-rt-loc { font-family: 'Space Mono', monospace; font-size: 9px; color: #888; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;}
            
            .ls-modal-footer { padding: 16px 24px 32px; border-top: 1px solid rgba(0,0,0,0.08); background: #fff; }
            .ls-btn-rebuild { width: 100%; background: transparent; border: 1px solid #111; color: #111; padding: 14px; border-radius: 8px; font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;}
            .ls-btn-rebuild:active { background: #111; color: #fff; transform: scale(0.98); }

            /* =========================================
               View 3: 具体动线 (Itinerary Log) 样式
               ========================================= */
            #ls-itineraryView .iti-top-nav { position: absolute; top: 0; left: 0; width: 100%; padding: max(env(safe-area-inset-top, 24px), 24px) 24px 24px; z-index: 50; display: flex; align-items: center; background: linear-gradient(to bottom, rgba(244,244,246,1) 0%, rgba(244,244,246,0) 100%); }
            #ls-itineraryView .iti-nav-brand { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 2px; color: #555; display: flex; align-items: center; gap: 8px; cursor: pointer;}
            #ls-itineraryView .iti-nav-brand:active { transform: translateX(-4px); }

            #ls-itineraryView .iti-main-scroll { position: relative; z-index: 5; height: 100%; width: 100%; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 90px 24px 140px 24px; mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%); }
            #ls-itineraryView .iti-main-scroll::-webkit-scrollbar { display: none; }

            .iti-header-typo { display: flex; flex-direction: column; margin-bottom: 70px; margin-top: 10px; }
            .iti-meta-row { display: flex; justify-content: space-between; font-family: 'Space Mono', monospace; font-size: 9px; color: #888; letter-spacing: 2px; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 12px; margin-bottom: 20px; text-transform: uppercase;}
            .iti-day-huge { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 64px; line-height: 0.85; color: #111; font-weight: 300; letter-spacing: -2px; margin-left: -4px; }
            .iti-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; }
            .iti-exact-date { font-family: 'Space Mono', monospace; font-size: 11px; color: #444; letter-spacing: 1px; text-transform: uppercase;}
            .iti-cn-title { font-size: 13px; font-weight: 400; letter-spacing: 12px; color: #000; margin-right: -12px; }

            .iti-schedule-track { position: relative; display: flex; flex-direction: column; gap: 45px; padding-left: 10px; }
            .iti-spine-line { position: absolute; left: 17px; top: 10px; bottom: -50px; width: 1px; border-left: 1px dashed rgba(0, 0, 0, 0.15); z-index: 1; }
            
            .iti-schedule-item { position: relative; cursor: pointer; display: flex; flex-direction: column; padding-left: 30px; transition: all 0.4s ease;}
            .iti-crosshair { position: absolute; left: -22px; top: 40px; color: rgba(0,0,0,0.2); transition: all 0.5s ease; z-index: 2; font-size: 14px; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;}
            .iti-time-bg { position: absolute; top: -18px; left: 10px; font-family: 'Cormorant Garamond', serif; font-size: 60px; line-height: 1; font-weight: 300; color: rgba(0, 0, 0, 0.03); transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); letter-spacing: -2px; z-index: 1; pointer-events: none; }
            
            .iti-milk-glass-card { position: relative; z-index: 3; background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(30px) saturate(150%); -webkit-backdrop-filter: blur(30px) saturate(150%); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 16px; padding: 24px; box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.04); transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .iti-floating-icon { position: absolute; top: -16px; right: 20px; width: 36px; height: 36px; background: #111; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 15px rgba(0,0,0,0.2); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); font-size: 18px;}

            .iti-card-header { display: flex; flex-direction: column; gap: 8px; padding-right: 30px; }
            .iti-item-no { font-family: 'Space Mono', monospace; font-size: 10px; color: #888; letter-spacing: 1px;}
            .iti-card-title { font-size: 17px; font-weight: 500; color: #222; letter-spacing: 0.5px; transition: color 0.3s; }
            .iti-card-location { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; font-weight: 300; }
            
            .iti-expand-panel { max-height: 0; opacity: 0; overflow: hidden; transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .iti-desc-text { font-size: 13px; line-height: 1.7; color: #555; font-weight: 300; margin-bottom: 20px; }

            /* States */
            .iti-schedule-item.is-past .iti-milk-glass-card { opacity: 0.65; box-shadow: none; border-color: rgba(0,0,0,0.05); }
            .iti-schedule-item.is-past .iti-crosshair { color: #111; transform: scale(0.6); border-radius: 50%; background: #ccc; content: ''; }
            .iti-schedule-item.is-past .iti-crosshair i { display: none; } 
            .iti-schedule-item.is-past .iti-time-bg { color: rgba(0, 0, 0, 0.015); }
            .iti-schedule-item.is-past .iti-floating-icon { background: #ccc; box-shadow: none; }

            .iti-schedule-item.is-active .iti-crosshair { color: #000; transform: rotate(90deg); }
            .iti-schedule-item.is-active .iti-time-bg { color: rgba(0, 0, 0, 0.85); transform: translateX(12px) translateY(-4px); }
            .iti-schedule-item.is-active .iti-milk-glass-card { background: rgba(255, 255, 255, 0.85); box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 1); transform: translateY(-2px); }
            .iti-schedule-item.is-active .iti-floating-icon::before { content: ''; position: absolute; inset: -2px; border-radius: 50%; border: 1px solid rgba(17, 17, 17, 0.3); animation: iti-ripple 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite; pointer-events: none; }
            .iti-schedule-item.is-active .iti-expand-panel { max-height: 250px; opacity: 1; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(0, 0, 0, 0.06); }
            @keyframes iti-ripple { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }

            .iti-schedule-item.is-deviation .iti-milk-glass-card { border: 1px solid rgba(217, 58, 58, 0.3); background: rgba(255, 255, 255, 0.8); box-shadow: 0 8px 30px rgba(217, 58, 58, 0.08); }
            .iti-schedule-item.is-deviation .iti-crosshair { color: #D93A3A; transform: rotate(45deg); }
            .iti-schedule-item.is-deviation .iti-floating-icon { background: #D93A3A; box-shadow: 0 6px 15px rgba(217, 58, 58, 0.3); }
            .iti-schedule-item.is-deviation .iti-card-title { text-decoration: line-through; color: #aaa; }
            .iti-dev-badge { color: #D93A3A; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; display: block; margin-top: 8px; letter-spacing: 0.5px; }

            .iti-editorial-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.05); }
            .iti-action-group { display: flex; gap: 16px; }
            .iti-action-btn { position: relative; background: none; border: none; cursor: pointer; font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #888; transition: color 0.4s ease; padding-bottom: 4px; display: flex; align-items: center; gap: 6px; text-transform: uppercase;}
            .iti-action-btn::after { content: ''; position: absolute; left: 0; bottom: 0; width: 0; height: 1px; background: #111; transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .iti-action-btn:hover { color: #111; }
            .iti-action-btn.is-active { color: #111; }
            .iti-action-btn.is-active::after { width: 100%; }

            .iti-sync-btn { color: #111; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; font-weight: 700;}
            .iti-sync-btn.is-synced { color: #D93A3A; }
            .iti-eq-visualizer { display: flex; align-items: flex-end; gap: 2px; height: 10px; margin-bottom: 2px; }
            .iti-eq-bar { width: 2px; height: 40%; background-color: currentColor; border-radius: 1px; transition: background-color 0.4s ease; }
            .iti-schedule-item.is-active .iti-eq-bar { animation: iti-eq-bounce 1s ease-in-out infinite alternate; }
            @keyframes iti-eq-bounce { from { height: 30%; } to { height: 100%; } }
            .iti-schedule-item.is-active .iti-eq-bar:nth-child(2) { animation-duration: 0.7s; }
            .iti-schedule-item.is-active .iti-eq-bar:nth-child(3) { animation-duration: 1.2s; }
        `;
        document.head.appendChild(style);

        // 2. 注入 HTML 结构 (包含 3 个视图)
        const screen = document.createElement('div');
        screen.id = 'lifestyle-screen';
        screen.className = 'screen';
        screen.innerHTML = `
            <div class="ambient-bg"><div class="grid-overlay"></div></div>
            
            <!-- View 1: 角色列表 -->
            <div class="ls-view active" id="ls-listView">
                <nav class="top-nav">
                    <button class="back-btn" onclick="Router.back()">Back</button>
                    <div class="nav-decor">
                        <span>ITINERARY</span>
                        <span class="decor-line"></span>
                        <span>VOL.01</span>
                    </div>
                </nav>
                <main class="list-container" id="ls-charList"></main>
                <div class="page-end">/// END OF RECORDS</div>
            </div>

            <!-- View 2: 行程概览页 -->
            <div class="ls-view" id="ls-detailView">
                <div class="ls-texture-overlay"></div>
                <nav class="ls-detail-nav">
                    <button class="ls-nav-btn-back" onclick="LifestyleModule.closeDetail()">
                        <i class="ph-bold ph-arrow-left"></i> ROSTER
                    </button>
                    <div class="ls-nav-meta">
                        <span class="ls-nav-id" id="ls-detail-id">UNKNOWN // 00</span>
                        <span class="ls-nav-status">LIVE SYNC</span>
                    </div>
                </nav>

                <section class="ls-hero-section">
                    <img src="" alt="Portrait" class="ls-parallax-image" id="ls-parallaxImg">
                    <div class="ls-hero-cut"></div>
                </section>

                <div class="ls-temporal-axis-wrapper">
                    <div class="ls-axis-glass">
                        <div class="ls-axis-track" id="ls-axisTrack"></div>
                    </div>
                </div>

                <section class="ls-briefing-section">
                    <div class="ls-bg-watermark">LOG.</div>
                    
                    <div class="ls-briefing-content" id="ls-briefingContent">
                        <div class="ls-brief-header">
                            <div class="ls-brief-title-wrap">
                                <span class="ls-brief-label" id="ls-briefLabel">TODAY'S BRIEF</span>
                                <h2 class="ls-brief-date" id="ls-briefDate">Thu, 24</h2>
                            </div>
                            <span class="ls-brief-status" id="ls-briefStatus">HIGH LOAD</span>
                        </div>

                        <div class="ls-brief-grid">
                            <div class="ls-data-block">
                                <span class="ls-data-key">Events</span>
                                <span class="ls-data-val"><strong id="ls-valEvents">00</strong> 项</span>
                            </div>
                            <div class="ls-data-block">
                                <span class="ls-data-key">Est. Time</span>
                                <span class="ls-data-val"><strong id="ls-valDuration">00</strong> H</span>
                            </div>
                        </div>

                        <div class="ls-anomaly-module" id="ls-anomalyModule">
                            <span class="ls-anomaly-tag">* DEVIATION DETECTED</span>
                            <p class="ls-anomaly-text" id="ls-anomalyText">...</p>
                        </div>

                        <div class="ls-actions-group">
                            <button class="ls-enter-action is-disabled" id="ls-btnEnterItinerary" onclick="LifestyleModule.openItinerary()">
                                <span class="ls-action-text" id="ls-btnEnterText">NO EVENTS SCHEDULED</span>
                                <i class="ph-bold ph-arrow-right ls-action-arrow"></i>
                            </button>
                            <button class="ls-config-action" onclick="LifestyleModule.openRoutineConfig()">
                                <span class="ls-config-text">ROUTINE CONFIG</span>
                                <i class="ph-bold ph-faders"></i>
                            </button>
                        </div>
                    </div>

                    <!-- 空状态阻断 -->
                    <div class="ls-empty-state-overlay" id="ls-emptyState">
                        <i class="ph-thin ph-clock-dashed ls-empty-icon"></i>
                        <h3 class="ls-empty-title">Uncharted Time</h3>
                        <p class="ls-empty-desc">系统暂未侦测到该角色的生活轨迹。<br>是否需要唤醒引擎，推演其作息架构？</p>
                        <button class="ls-init-btn" onclick="LifestyleModule.generateRoutine()">
                            <i class="ph-bold ph-sparkle"></i> INITIALIZE ROUTINE
                        </button>
                    </div>
                </section>

                <!-- 作息可视化面板 (Bottom Sheet) -->
                <div class="ls-modal-overlay" id="ls-routineModal" onclick="LifestyleModule.closeRoutineConfig()">
                    <div class="ls-modal-sheet" onclick="event.stopPropagation()">
                        <div class="ls-modal-header">
                            <span class="ls-modal-title">Routine Archival</span>
                            <button class="ls-modal-close" onclick="LifestyleModule.closeRoutineConfig()"><i class="ph-thin ph-x"></i></button>
                        </div>
                        <div class="ls-modal-body" id="ls-routineContent"></div>
                        <div class="ls-modal-footer">
                            <button class="ls-btn-rebuild" onclick="LifestyleModule.rebuildRoutine()">
                                <i class="ph-bold ph-arrows-clockwise"></i> RE-GENERATE ROUTINE
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- View 3: 具体动线页 (Itinerary Log) -->
            <div class="ls-view" id="ls-itineraryView">
                <div class="vertical-marginalia">LIFESTYLE ENGINE // TEMPORAL SYNC</div>
                
                <nav class="iti-top-nav">
                    <span class="iti-nav-brand" onclick="LifestyleModule.closeItinerary()"><i class="ph-bold ph-arrow-left" style="font-size: 14px;"></i> BACK</span>
                </nav>

                <div class="iti-main-scroll">
                    <header class="iti-header-typo">
                        <div class="iti-meta-row">
                            <span>LOG // <span id="iti-logNo">00</span></span>
                            <span id="iti-gps">LAT 31.2°N / LON 121.4°E</span>
                        </div>
                        <h1 class="iti-day-huge" id="iti-dayName">Thursday</h1>
                        <div class="iti-bottom-row">
                            <div class="iti-exact-date" id="iti-dateStr">OCT 24, 2026</div>
                            <div class="iti-cn-title">今日动线</div>
                        </div>
                    </header>

                    <div class="iti-schedule-track" id="iti-scheduleTrack">
                        <!-- 动态渲染区 -->
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.device').appendChild(screen);

        // 视差滚动绑定
        const detailView = document.getElementById('ls-detailView');
        const parallaxImg = document.getElementById('ls-parallaxImg');
        detailView.addEventListener('scroll', () => {
            const scrollY = detailView.scrollTop;
            if (scrollY < window.innerHeight * 0.6) {
                parallaxImg.style.transform = `translateY(${scrollY * 0.35}px)`;
            }
        });

        _initialized = true;
    }

    async function onEnter() {
        if (!_initialized) init();

        const listContainer = document.getElementById('ls-charList');
        if (!listContainer) return;

        try { _chars = await DB.characters.getAll(); } catch(e) { _chars =[]; }

        if (_chars.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; padding: 60px 20px; color:var(--text-sub); font-family:'Space Mono', monospace; font-size: 10px; letter-spacing: 2px;">NO IDENTITIES FOUND</div>`;
            return;
        }

        let html = '';
        for (const[idx, char] of _chars.entries()) {
            let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80'; 
            if (char.avatarUrl) {
                avatarUrl = await Assets.getUrl(char.avatarUrl).catch(() => avatarUrl) || avatarUrl;
            }

            const desc1 = char.title || 'CLASSIFIED IDENTITY';
            const desc2 = char.mbti ? `TYPE: ${char.mbti}` : 'SECTOR UNKNOWN';
            const syncRate = Math.floor(Math.random() * 20 + 80); 
            const freqRate = String(idx + 1).padStart(2, '0');

            html += `
            <div class="ls-card" onclick="LifestyleModule.openDetail('${char.id}')">
                <div class="card-img-wrap">
                    <img src="${avatarUrl}" alt="${char.name}" class="card-img">
                    <div class="card-img-gradient"></div>
                </div>
                <div class="card-content">
                    <div class="content-main">
                        <div class="info-left">
                            <h2 class="char-title">${char.name}</h2>
                            <div class="char-desc">${desc1}<br>${desc2}</div>
                        </div>
                        <div class="stats-right">
                            <div class="stat-item">
                                <span class="stat-val">${syncRate}%</span>
                                <span class="stat-label">SYNC</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <span class="stat-val">${freqRate}</span>
                                <span class="stat-label">INDEX</span>
                            </div>
                        </div>
                    </div>
                    <hr class="hr-line">
                    <div class="content-footer">
                        <div class="footer-author">HOST: <span>SYSTEM</span></div>
                        <div class="footer-time">STATUS: ACTIVE</div>
                    </div>
                </div>
            </div>`;
        }

        listContainer.innerHTML = html;

        setTimeout(() => {
            const observerOptions = { root: document.getElementById('ls-listView'), threshold: 0.15 };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('in-view');
                });
            }, observerOptions);
            document.querySelectorAll('#ls-listView .ls-card').forEach(card => observer.observe(card));
        }, 50);
    }

    // ==========================================
    // 时间演算引擎核心 (Routine -> Schedule)
    // ==========================================
    function _addRandomOffset(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        let totalMins = h * 60 + m;
        // 随机偏移 -15 到 +15 分钟，体现活人感
        const offset = Math.floor(Math.random() * 31) - 15; 
        totalMins += offset;
        if (totalMins < 0) totalMins = 0;
        if (totalMins > 23 * 60 + 59) totalMins = 23 * 60 + 59;
        const nh = Math.floor(totalMins / 60);
        const nm = totalMins % 60;
        return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`;
    }

    function _guessIcon(title, type) {
        const t = (title + type).toLowerCase();
        if (t.includes('咖啡') || t.includes('茶') || t.includes('餐') || t.includes('饭') || t.includes('吃')) return 'ph-fill ph-coffee';
        if (t.includes('会') || t.includes('工作') || t.includes('处理') || t.includes('室')) return 'ph-fill ph-briefcase';
        if (t.includes('跑') || t.includes('运动') || t.includes('健身') || t.includes('普拉提')) return 'ph-fill ph-sneaker';
        if (t.includes('读') || t.includes('书') || t.includes('学习')) return 'ph-fill ph-book-open';
        if (t.includes('拍') || t.includes('相')) return 'ph-fill ph-camera';
        if (t.includes('影') || t.includes('片') || t.includes('剧')) return 'ph-fill ph-film-strip';
        if (t.includes('音乐') || t.includes('听') || t.includes('唱片')) return 'ph-fill ph-disc';
        if (t.includes('睡') || t.includes('息')) return 'ph-fill ph-bed';
        return 'ph-fill ph-wind'; // 默认松弛感风向标
    }

    async function _getOrCreateSchedule(charId, dateStr) {
        const schedId = `sch_${charId}_${dateStr}`;
        let sched = null;
        try {
            sched = await DB.schedules.get(schedId);
        } catch(e) {}

        if (sched) return sched;

        // 如果没有今日具体行程，查 routine 生成一份
        const routine = await DB.routines.get(String(charId));
        if (!routine) return null; // 连基底作息都没有，返回 null

        const newEvents =[];
        let seqCounter = 1;

        // 起床事件
        if (routine.wakeUp) {
            newEvents.push({
                id: `ev_${Date.now()}_${seqCounter}`,
                no: `SEQ-${String(seqCounter++).padStart(2,'0')}`,
                time: _addRandomOffset(routine.wakeUp),
                title: '晨间苏醒',
                location: '住处',
                icon: 'ph-fill ph-sun-horizon',
                state: 'future', // 初始默认，之后按当前时间重算
                description: '一日之计的开始，准备迎接新的一天。',
                type: '日常'
            });
        }

        // 常规事件
        (routine.events ||[]).forEach(ev => {
            newEvents.push({
                id: `ev_${Date.now()}_${seqCounter}`,
                no: `SEQ-${String(seqCounter++).padStart(2,'0')}`,
                time: _addRandomOffset(ev.time),
                title: ev.title,
                location: ev.location || '未知',
                icon: _guessIcon(ev.title, ev.type),
                state: 'future',
                description: `预定于 ${ev.location} 进行 ${ev.title}。`,
                type: ev.type || '日常'
            });
        });

        // 睡觉事件
        if (routine.sleep) {
            newEvents.push({
                id: `ev_${Date.now()}_${seqCounter}`,
                no: `SEQ-${String(seqCounter++).padStart(2,'0')}`,
                time: _addRandomOffset(routine.sleep),
                title: '夜间休眠',
                location: '住处',
                icon: 'ph-fill ph-moon',
                state: 'future',
                description: '结束一天的日程，进入休息状态。',
                type: '日常'
            });
        }

        // 按真实偏移后的时间排序
        newEvents.sort((a, b) => a.time.localeCompare(b.time));
        // 重新编排 SEQ 序号
        newEvents.forEach((ev, i) => ev.no = `SEQ-${String(i+1).padStart(2,'0')}`);

        const newSchedule = {
            id: schedId,
            charId: String(charId),
            date: dateStr,
            events: newEvents
        };

        await DB.schedules.put(newSchedule);
        return newSchedule;
    }

    // ── 根据当前真实时间，评判事件状态 ──
    function _evaluateScheduleState(schedule, isToday) {
        if (!schedule || !schedule.events) return;
        
        if (!isToday) {
            // 如果看的不是今天，直接全标过去或未来（这里简单处理为，不是今天就是过去的存档）
            // 真实逻辑可对比日期，若是明后天则标 future
            schedule.events.forEach(ev => {
                if (ev.state !== 'deviation') ev.state = 'past';
            });
            return;
        }

        const now = new Date();
        const nowTimeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        // 寻找当前激活的事件（时间最近且早于等于现在的事件）
        let activeIndex = -1;
        for (let i = schedule.events.length - 1; i >= 0; i--) {
            if (schedule.events[i].time <= nowTimeStr) {
                activeIndex = i;
                break;
            }
        }

        schedule.events.forEach((ev, i) => {
            if (ev.state === 'deviation') return; // 偏差状态锁定，不随时间自动覆盖
            if (i < activeIndex) ev.state = 'past';
            else if (i === activeIndex) ev.state = 'active';
            else ev.state = 'future';
        });
    }

    async function _buildWeekData() {
        const today = new Date();
        const currentDayOfWeek = today.getDay() || 7; 
        const monday = new Date(today);
        monday.setDate(today.getDate() - currentDayOfWeek + 1);

        const days =['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const weekData =[];

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            const isToday = d.toDateString() === today.toDateString();

            // 🌟 尝试去取这一天的真实日程实例
            let eventCount = 0;
            let hasAnomaly = false;
            let anomalyText = '';
            
            if (_currentDetailCharId) {
                try {
                    const sch = await _getOrCreateSchedule(_currentDetailCharId, dateStr);
                    if (sch && sch.events) {
                        eventCount = sch.events.length;
                        const deviations = sch.events.filter(e => e.state === 'deviation');
                        if (deviations.length > 0) {
                            hasAnomaly = true;
                            anomalyText = deviations.map(d => d.devText || `[${d.title}] 发生偏差`).join('；');
                        }
                    }
                } catch(e) {}
            }

            weekData.push({
                day: days[i],
                date: String(d.getDate()).padStart(2, '0'),
                fullDate: dateStr,
                isToday: isToday,
                events: eventCount,
                duration: eventCount > 0 ? Math.floor(eventCount * 2.5) : 0, // 简易估算耗时
                load: eventCount >= 6 ? 'HIGH LOAD' : (eventCount >= 3 ? 'NORMAL' : (eventCount > 0 ? 'CHILL' : 'VOID')),
                hasAnomaly: hasAnomaly,
                anomalyText: anomalyText
            });

            if (isToday) _selectedDateIndex = i;
        }
        return weekData;
    }

    // ==========================================
    // 详情概览页逻辑 (Detail View)
    // ==========================================
    async function openDetail(charId) {
        _currentDetailCharId = charId;
        const char = _chars.find(c => String(c.id) === String(charId));
        if (!char) return;

        document.getElementById('ls-detail-id').textContent = `${char.name} // ${String(char.id).padStart(2,'0')}`;
        
        let avatarUrl = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop';
        if (char.avatarUrl) {
            avatarUrl = await Assets.getUrl(char.avatarUrl).catch(() => avatarUrl) || avatarUrl;
        }
        document.getElementById('ls-parallaxImg').src = avatarUrl;

        // 检查基础作息是否存在
        const routine = await DB.routines.get(charId).catch(() => null);
        const emptyOverlay = document.getElementById('ls-emptyState');
        
        if (!routine) {
            emptyOverlay.classList.add('active');
            // 如果没有作息，无法生成 week data，先用个假的顶住 UI，等用户点击初始化
            _currentWeekData = _buildFakeWeekData(); 
        } else {
            emptyOverlay.classList.remove('active');
            // 如果有作息，触发真实推演
            _currentWeekData = await _buildWeekData();
        }

        _renderTemporalAxis();
        _updateBriefingData();

        document.getElementById('ls-detailView').classList.add('active');
    }

    function _buildFakeWeekData() {
        const today = new Date();
        const days =['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const weekData =[];
        for (let i = 0; i < 7; i++) {
            weekData.push({ day: days[i], date: String(today.getDate()), fullDate: '', isToday: i===3, events:0, duration:0, load:'VOID', hasAnomaly:false });
            if (i===3) _selectedDateIndex = i;
        }
        return weekData;
    }

    function closeDetail() {
        document.getElementById('ls-detailView').classList.remove('active');
        _currentDetailCharId = null;
    }

    // ── 渲染概览轴与数据 ──
    function _renderTemporalAxis() {
        const track = document.getElementById('ls-axisTrack');
        track.innerHTML = '';
        _currentWeekData.forEach((item, index) => {
            const isSelected = index === _selectedDateIndex;
            const anomalyClass = item.hasAnomaly ? 'has-anomaly' : '';
            const selectedClass = isSelected ? 'is-selected' : '';

            const node = document.createElement('div');
            node.className = `ls-axis-node ${selectedClass}`;
            node.innerHTML = `
                <span class="ls-node-day">${item.day.charAt(0)}</span>
                <div class="ls-node-dot ${anomalyClass}"></div>
                <span class="ls-node-date">${item.date}</span>
            `;
            node.onclick = () => {
                if (index === _selectedDateIndex) return;
                _selectedDateIndex = index;
                _updateAxisStyles();
                _updateBriefingWithAnimation();
            };
            track.appendChild(node);
        });
    }

    function _updateAxisStyles() {
        document.querySelectorAll('#ls-axisTrack .ls-axis-node').forEach((node, index) => {
            node.classList.toggle('is-selected', index === _selectedDateIndex);
        });
    }

    function _updateBriefingData() {
        const data = _currentWeekData[_selectedDateIndex];
        if (!data) return;

        document.getElementById('ls-briefLabel').textContent = data.isToday ? "TODAY'S BRIEF" : "ARCHIVE BRIEF";
        document.getElementById('ls-briefDate').textContent = `${data.day}, ${data.date}`;
        document.getElementById('ls-briefStatus').textContent = data.load;
        document.getElementById('ls-valEvents').textContent = String(data.events).padStart(2, '0');
        document.getElementById('ls-valDuration').textContent = String(data.duration).padStart(2, '0');

        const anomalyModule = document.getElementById('ls-anomalyModule');
        if (data.hasAnomaly) {
            anomalyModule.style.display = 'block';
            document.getElementById('ls-anomalyText').textContent = data.anomalyText;
        } else {
            anomalyModule.style.display = 'none';
        }

        const btn = document.getElementById('ls-btnEnterItinerary');
        const btnText = document.getElementById('ls-btnEnterText');
        if (data.events > 0) {
            btn.classList.remove('is-disabled');
            btnText.textContent = 'ENTER ITINERARY LOG';
        } else {
            btn.classList.add('is-disabled');
            btnText.textContent = 'NO EVENTS SCHEDULED';
        }
    }

    function _updateBriefingWithAnimation() {
        const content = document.getElementById('ls-briefingContent');
        content.classList.add('is-animating');
        setTimeout(async () => {
            _updateBriefingData();
            content.classList.remove('is-animating');
        }, 200); 
    }

    // ==========================================
    // View 3: 具体动线页 (Itinerary Log)
    // ==========================================
    async function openItinerary() {
        const btn = document.getElementById('ls-btnEnterItinerary');
        if (btn.classList.contains('is-disabled')) return;

        const data = _currentWeekData[_selectedDateIndex];
        if (!data || !data.fullDate) return;

        // 1. 获取或生成 Schedule 实例
        const schedule = await _getOrCreateSchedule(_currentDetailCharId, data.fullDate);
        if (!schedule) { Toast.show('行程数据丢失'); return; }
        
        // 2. 根据系统时间评判状态
        _evaluateScheduleState(schedule, data.isToday);
        // 保存算好状态的数据供后续渲染使用
        _currentSchedule = schedule;

        // 3. 更新页面头部数据
        const dObj = new Date(data.fullDate);
        const dayNames =['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const monthNames =['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        
        document.getElementById('iti-logNo').textContent = String(dObj.getMonth()+1).padStart(2,'0') + String(dObj.getDate()).padStart(2,'0');
        document.getElementById('iti-dayName').textContent = dayNames[dObj.getDay()];
        document.getElementById('iti-dateStr').textContent = `${monthNames[dObj.getMonth()]} ${dObj.getDate()}, ${dObj.getFullYear()}`;
        
        // 4. 找到当前正在 active 的卡片，默认展开
        const activeEv = schedule.events.find(e => e.state === 'active');
        _activeItiId = activeEv ? activeEv.id : null;
        
        // 5. 渲染轨道
        _renderItineraryTrack();

        // 6. 滑入视图
        document.getElementById('ls-itineraryView').classList.add('active');
    }

    function closeItinerary() {
        document.getElementById('ls-itineraryView').classList.remove('active');
        _currentSchedule = null;
    }

    // ── 渲染具体的行程时间轴卡片 ──
    function _renderItineraryTrack() {
        const track = document.getElementById('iti-scheduleTrack');
        if (!_currentSchedule || !_currentSchedule.events) {
            track.innerHTML = ''; return;
        }

        track.innerHTML = _currentSchedule.events.map(item => {
            const stateClass = item.state === 'past' ? 'is-past' : 
                               item.state === 'deviation' ? 'is-deviation' : 
                               item.state === 'active' || item.id === _activeItiId ? 'is-active' : '';
            
            const devHtml = item.state === 'deviation' ? `<span class="iti-dev-badge">[DEVIATION] ${item.devText || '突发偏移'}</span>` : '';

            return `
            <div class="iti-schedule-item ${stateClass}" onclick="LifestyleModule.toggleItiCard('${item.id}')">
                <div class="iti-spine-line"></div>
                <div class="iti-crosshair"><i class="ph-bold ph-plus"></i></div>
                <div class="iti-time-bg">${item.time}</div>
                
                <div class="iti-milk-glass-card">
                    <div class="iti-floating-icon"><i class="${item.icon}"></i></div>
                    
                    <div class="iti-card-header">
                        <span class="iti-item-no">${item.no}</span>
                        <h3 class="iti-card-title">${item.title}</h3>
                        ${devHtml}
                        <div class="iti-card-location">
                            <i class="ph-bold ph-map-pin"></i>
                            <span>${item.location}</span>
                        </div>
                    </div>

                    <div class="iti-expand-panel">
                        <p class="iti-desc-text">${item.description}</p>
                        
                        <div class="iti-editorial-actions">
                            <div class="iti-action-group">
                                <button class="iti-action-btn" onclick="event.stopPropagation(); alert('此功能筹备中: 查看历史上下文')">CONTEXT</button>
                                <button class="iti-action-btn" onclick="event.stopPropagation(); alert('此功能筹备中: 主动制造事件偏差')">DEVIATION</button>
                            </div>
                            
                            <button class="iti-sync-btn ${_syncedIds.includes(item.id) ? 'is-synced' : ''}" onclick="LifestyleModule.syncToChat(event, '${item.id}')">
                                <div class="iti-eq-visualizer">
                                    <div class="iti-eq-bar"></div><div class="iti-eq-bar"></div><div class="iti-eq-bar"></div>
                                </div>
                                SYNC
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    function toggleItiCard(id) {
        _activeItiId = (_activeItiId === id) ? null : id;
        _renderItineraryTrack();
    }

    function syncToChat(e, id) {
        e.stopPropagation();
        if (_syncedIds.includes(id)) {
            _syncedIds = _syncedIds.filter(i => i !== id);
        } else {
            _syncedIds.push(id);
            Toast.show('【系统预留钩子】此行程点已被标记，将同步到聊天流系统提示中。');
        }
        _renderItineraryTrack();
    }

    // ==========================================
    // AI 唤醒作息引擎 (The Genesis)
    // ==========================================
    async function generateRoutine() {
        if (!_currentDetailCharId) return;
        const char = _chars.find(c => String(c.id) === String(_currentDetailCharId));
        if (!char) return;

        const btn = document.querySelector('.ls-init-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="ph-bold ph-spinner" style="animation: spin 1s linear infinite;"></i> SYNCING...`;
        btn.style.pointerEvents = 'none';

        try {
            const activeApi = await DB.api.getActive();
            if (!activeApi) throw new Error('未配置 API，无法推演作息');

            const prompt = `[系统后台调度：生成角色基础作息模板]
请根据以下角色档案，推理出 ta 在工作日的一个典型 24 小时作息框架。
角色名：${char.name}
性格与背景：${char.persona}
${char.mbti ? 'MBTI：' + char.mbti : ''}

【输出格式要求】：
严格返回 JSON 对象，不要任何其他废话。
{
  "wakeUp": "HH:MM", // 起床时间
  "sleep": "HH:MM", // 就寝时间
  "mainActivity": "核心身份与主线活动（如：独立插画师 / 医学生），10个字以内",
  "tags": ["夜猫子", "工作狂", "规律作息"], // 描述生活状态的3个短标签
  "events":[
    // 请提供 5-8 个关键的时间锚点事件，贯穿起床到睡觉
    { "time": "08:00", "title": "手冲咖啡与晨读", "location": "家里阳台", "status": "正在喝咖啡", "type": "日常" },
    { "time": "10:00", "title": "处理核心业务", "location": "工作室", "status": "专心工作中", "type": "工作" }
  ]
}`;

            const response = await ApiHelper.chatCompletion(activeApi,[{ role: 'system', content: prompt }]);
            const cleaned = response.replace(/```json|```/g, '').trim();
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start === -1 || end === -1) throw new Error('AI返回数据异常');
            
            const routineData = JSON.parse(cleaned.substring(start, end + 1));
            routineData.charId = String(_currentDetailCharId);
            routineData.updatedAt = Date.now();

            await DB.routines.put(routineData);
            Toast.show('作息时间轴已成功推演 ✦');
            document.getElementById('ls-emptyState').classList.remove('active');
            
            // 重新加载 weekData 以便能生成 schedule
            _currentWeekData = await _buildWeekData();
            _renderTemporalAxis();
            _updateBriefingData();

            openRoutineConfig();

        } catch (e) {
            console.error('[Lifestyle] generateRoutine Error:', e);
            Toast.show('引擎唤醒失败：' + e.message);
        } finally {
            btn.innerHTML = originalText;
            btn.style.pointerEvents = 'auto';
        }
    }

    // ==========================================
    // 作息管理面板 (Routine Config)
    // ==========================================
    async function openRoutineConfig() {
        if (!_currentDetailCharId) return;
        const routine = await DB.routines.get(_currentDetailCharId).catch(() => null);
        if (!routine) { Toast.show('系统缺失该角色作息数据，请先初始化'); return; }

        const contentBox = document.getElementById('ls-routineContent');
        const tagsHtml = (routine.tags ||[]).map(t => `<span class="ls-rt-tag">${t}</span>`).join('');
        const timelineHtml = (routine.events ||[]).map(ev => `
            <div class="ls-rt-event">
                <div class="ls-rt-time">${ev.time}</div>
                <div class="ls-rt-title">${ev.title}</div>
                <div class="ls-rt-loc"><i class="ph-fill ph-map-pin"></i> ${ev.location} &nbsp;&nbsp; <i class="ph-fill ph-user-focus"></i> ${ev.status}</div>
            </div>
        `).join('');

        contentBox.innerHTML = `
            <div style="font-family:'Playfair Display', 'Noto Serif SC', serif; font-style: italic; font-size: 22px; font-weight: 600; margin-bottom: 12px;">${routine.mainActivity || 'Daily Routine'}</div>
            <div class="ls-routine-tags">${tagsHtml}</div>
            <div class="ls-routine-meta">
                <div class="ls-meta-box"><span class="ls-meta-label">WAKE UP / 唤醒</span><span class="ls-meta-val">${routine.wakeUp || '--:--'}</span></div>
                <div class="ls-meta-box"><span class="ls-meta-label">SLEEP / 休眠</span><span class="ls-meta-val">${routine.sleep || '--:--'}</span></div>
            </div>
            <div style="font-family:'Space Mono', monospace; font-size:10px; color:#888; letter-spacing:2px; margin-bottom:16px; text-transform:uppercase;">Time Schedule</div>
            <div class="ls-routine-timeline">${timelineHtml}</div>
        `;

        document.getElementById('ls-routineModal').classList.add('active');
    }

    function closeRoutineConfig() {
        document.getElementById('ls-routineModal').classList.remove('active');
    }

    function rebuildRoutine() {
        if (confirm('确认要重新推演角色的作息规律吗？\n当前生成的时刻表将被覆盖。')) {
            closeRoutineConfig(); 
            document.getElementById('ls-emptyState').classList.add('active');
            generateRoutine(); 
        }
    }

    // ==========================================
    // 暴露给 ChatModule 顶栏的状态接口
    // ==========================================
    async function getCurrentStatus(charId) {
        try {
            // 优先查今天的 schedule (带波动和突发的真实数据)
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const sched = await DB.schedules.get(`sch_${charId}_${dateStr}`).catch(()=>null);
            
            const nowTimeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            
            if (sched && sched.events) {
                // 有真实行程，找最近的一个
                let currentEvent = sched.events[0];
                for (let i = sched.events.length - 1; i >= 0; i--) {
                    if (sched.events[i].time <= nowTimeStr) {
                        currentEvent = sched.events[i];
                        break;
                    }
                }
                // 如果是偏差事件，可以在聊天页顶栏显示红色的特殊状态！
                if (currentEvent.state === 'deviation') return `⚠ 突发：${currentEvent.title}`;
                return currentEvent ? currentEvent.title : 'ACTIVE RECORD'; // 用 title 代替 status 更具场景感
            }

            // 没有 schedule，降级查 base routine
            const routine = await DB.routines.get(String(charId));
            if (!routine || !routine.events) return null;
            
            let currentEv = routine.events[0];
            for (const ev of routine.events) {
                if (ev.time <= nowTimeStr) currentEv = ev;
                else break;
            }
            return currentEv ? currentEv.status : 'ACTIVE RECORD';
        } catch(e) {
            return null;
        }
    }

    return { 
        init, onEnter, openDetail, closeDetail, 
        generateRoutine, getCurrentStatus, 
        openRoutineConfig, closeRoutineConfig, rebuildRoutine,
        openItinerary, closeItinerary, toggleItiCard, syncToChat
    };
})();