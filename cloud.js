'use strict';

/**
 * ============================================================
 * CloudModule — Supabase 云原生同步引擎 (高定视觉版) + 离线收发室
 * ============================================================
 */
const CloudModule = (() => {
  // 1. 动态加载 Supabase SDK
  if (!window.supabase) {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@supabase/supabase-js@2";
    document.head.appendChild(script);
  }

  // 2. 专属高级 UI 样式
  const style = document.createElement('style');
  style.textContent = `
    #cloud-screen { 
      z-index: 250; 
      background: var(--s-bg); 
      font-family: 'Noto Sans SC', sans-serif;
    }
    #cloud-screen .cloud-hint-box {
      font-family: 'Space Mono', monospace; 
      font-size: 0.6rem; 
      color: var(--s-text-secondary); 
      line-height: 1.6; 
      margin-top: 16px; 
      background: rgba(0,0,0,0.02); 
      padding: 16px; 
      border: 1px dashed rgba(18,18,18,0.15); 
      border-radius: 8px;
      text-transform: uppercase; 
      letter-spacing: 1px;
    }[data-theme="dark"] #cloud-screen .cloud-hint-box {
      background: rgba(255,255,255,0.02); 
      border-color: rgba(255,255,255,0.15);
    }
    #cloud-screen .status-dot {
      display: inline-block; 
      width: 6px; height: 6px; 
      background: #2d6a4a; 
      border-radius: 50%; 
      margin-right: 6px; 
      animation: cloud-pulse 2s infinite;
      vertical-align: middle;
    }
    @keyframes cloud-pulse {
      0% { box-shadow: 0 0 0 0 rgba(45, 106, 74, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(45, 106, 74, 0); }
      100% { box-shadow: 0 0 0 0 rgba(45, 106, 74, 0); }
    }
  `;
  document.head.appendChild(style);

  // 3. 高级感 HTML 布局
  const cloudHTML = `
    <div id="cloud-screen" class="screen">
      <div class="bg-watermark">C</div>
      <div class="main-view">
        <button class="main-back-btn" onclick="CloudModule.close()">Back</button>
        <header class="main-header">
          <h1 class="main-title">Sync.</h1>
          <div class="main-subtitle">SUPABASE NEURAL LINK</div>
        </header>
        <div class="content-scroll" style="padding: 0;">
          
          <div class="form-section">
            <div class="section-title">节点接入 / Node Connection</div>
            <div class="input-wrapper" style="margin-bottom:12px;">
              <label class="label-text">Project URL / 项目地址</label>
              <input type="text" id="cloud-url" class="input-line" placeholder="https://xxxxx.supabase.co">
            </div>
            <div class="input-wrapper" style="margin-bottom:24px;">
              <label class="label-text">Anon Key / 匿名密钥</label>
              <input type="password" id="cloud-key" class="input-line" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
            </div>
          </div>

          <div class="form-section">
            <div class="section-title">全量同步 / Global Sync</div>
            <div style="display:flex; gap:12px;">
              <button class="btn-outline" id="btn-sync-down" style="flex:1; border-color:var(--s-text-secondary); color:var(--s-text-secondary);" onclick="CloudModule.syncDown()">
                <i class="ph-light ph-cloud-arrow-down"></i> PULL / 拉取
              </button>
              <button class="btn-primary" id="btn-sync-up" style="flex:1; background:var(--s-text-primary); color:var(--s-bg);" onclick="CloudModule.syncUp()">
                <i class="ph-light ph-cloud-arrow-up"></i> PUSH / 上传
              </button>
            </div>
            
            <div class="cloud-hint-box">
              <div><span class="status-dot"></span> Postgres & Storage Engine</div>
              <div style="margin-top:8px; padding-top:8px; border-top: 0.5px dashed rgba(18,18,18,0.1); opacity: 0.8; font-size:0.55rem; line-height:1.8;">
                • 文本与图片物理分离存储<br>
                • 无极扩容，安全传输<br>
                ⚠️ 拉取与上传均为全量覆盖操作
              </div>
            </div>
          </div>

          <div class="form-section" style="margin-top:32px;">
            <div class="section-title">神经元模块 / Neural Engine</div>
            <div style="font-size:0.75rem; color:var(--s-text-secondary); line-height:2.2; font-family:'Space Mono', monospace; text-transform: uppercase;">
              <i class="ph-light ph-database"></i> PgVector Long-term RAG<br>
              <i class="ph-light ph-brain"></i> Autonomous Edge Agent<br>
              <i class="ph-light ph-bell-ringing"></i> Web Push Notification
            </div>
            
            <div style="margin-top:16px; padding:16px; background:rgba(0,0,0,0.02); border:1px solid rgba(18,18,18,0.1); border-radius:8px;">
              <div style="font-size:0.85rem; font-weight:600; color:var(--s-text-primary); margin-bottom:8px;">开启真·离线推送</div>
              <div style="font-size:0.6rem; color:var(--s-text-secondary); margin-bottom:12px; line-height:1.5;">授权后，即使关闭浏览器，大模型也能在后台通过系统通知主动找你。</div>
              
              <div class="input-wrapper" style="margin-bottom:16px;">
                <label class="label-text">VAPID Public Key / 推送公钥</label>
                <input type="text" id="vapid-key" class="input-line" placeholder="BEl6... (用户自行填入)">
              </div>

              <button class="btn-outline" style="width:100%; border-color:var(--s-text-primary); color:var(--s-text-primary);" onclick="CloudModule.requestPushPermission()">
                <i class="ph-bold ph-bell-ringing"></i> 允许发送系统通知
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
  
  function _injectHTML() {
    const device = document.querySelector('.device');
    if (device && !document.getElementById('cloud-screen')) {
      device.insertAdjacentHTML('beforeend', cloudHTML);
    }
  }
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', _injectHTML);
  } else {
    _injectHTML();
  }

  async function _getRawDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('chillOS');
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
  }

  // 获取带弹窗验证的 supabase 实例
  function _getSupabase() {
    const url = document.getElementById('cloud-url').value.trim().replace(/\/$/, '');
    const key = document.getElementById('cloud-key').value.trim();
    if (!url || !key) {
      Toast.show('请填写 Project URL 与 Anon Key');
      return null;
    }
    if (!window.supabase) {
      Toast.show('Supabase SDK 仍在加载，请稍等一秒');
      return null;
    }
    DB.settings.set('cloud-url', url);
    DB.settings.set('cloud-key', key);
    return window.supabase.createClient(url, key);
  }

  // 🌟 静默获取 Supabase 实例（不弹窗，专门给后台静默收件用）
  async function _getSupabaseSilent() {
    try {
      const url = await DB.settings.get('cloud-url');
      const key = await DB.settings.get('cloud-key');
      if (!url || !key || !window.supabase) return null;
      return window.supabase.createClient(url, key);
    } catch(e) { return null; }
  }

  async function open() {
    try {
      const savedUrl = await DB.settings.get('cloud-url');
      const savedKey = await DB.settings.get('cloud-key');
      const savedVapid = await DB.settings.get('cloud-vapid');
      if (savedUrl) document.getElementById('cloud-url').value = savedUrl;
      if (savedKey) document.getElementById('cloud-key').value = savedKey;
      if (savedVapid) document.getElementById('vapid-key').value = savedVapid;
    } catch(e) {}
    document.getElementById('cloud-screen').classList.add('active');
  }

  function close() {
    document.getElementById('cloud-screen').classList.remove('active');
  }

  function _showCloudConfirm(title, message, btnText) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay show';
      overlay.style.cssText = 'z-index: 9999; align-items: center; justify-content: center; display: flex; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);';
      overlay.innerHTML = `
        <div class="cv-mag-modal" style="background:var(--bg-card,#fff); border:0.5px solid rgba(18,18,18,0.1); border-radius:28px; padding:32px 24px; box-shadow:0 40px 80px rgba(0,0,0,0.2); text-align:center; max-width:320px; width:90%; position:relative; overflow:hidden;">
          <i class="ph-thin ph-warning-circle" style="font-size:2.5rem;color:#D93A3A;margin-bottom:16px;"></i>
          <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:500;font-style:italic;color:var(--text-main,#121212);line-height:1.2;margin-bottom:8px;">${title}</h2>
          <p style="font-size:0.8rem;color:var(--text-sub,#999);margin-bottom:32px;line-height:1.5;">${message}</p>
          <div style="display:flex;gap:12px;">
            <button id="cc-cancel" style="flex:1;padding:14px 0;border-radius:100px;background:transparent;border:0.5px solid rgba(18,18,18,0.2);color:var(--text-main,#121212);font-weight:600;font-size:0.85rem;cursor:pointer;">取消</button>
            <button id="cc-confirm" style="flex:1;padding:14px 0;border-radius:100px;background:#D93A3A;border:none;color:#fff;font-weight:600;font-size:0.85rem;cursor:pointer;box-shadow:0 8px 20px rgba(217,58,58,0.2);">${btnText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      overlay.querySelector('#cc-cancel').onclick = () => { overlay.remove(); resolve(false); };
      overlay.querySelector('#cc-confirm').onclick = () => { overlay.remove(); resolve(true); };
    });
  }

  async function syncUp() {
    const supabase = _getSupabase();
    if (!supabase) return;

    const confirmed = await _showCloudConfirm('Push to Cloud', '警告：上传将完全覆盖云端现有的备份数据。<br>确定要执行上传吗？', '确认覆盖');
    if (!confirmed) return;

    const btn = document.getElementById('btn-sync-up');
    const oriText = btn.innerHTML;
    btn.style.pointerEvents = 'none';

    try {
      const db = await _getRawDB();
      const stores = Array.from(db.objectStoreNames);
      const payload = { _meta: { version: db.version, timestamp: Date.now() }, assets_meta:[] };
      const assetsToUpload =[];

      btn.innerHTML = '<i class="ph-light ph-spinner" style="animation:spin 1s linear infinite"></i> 提取本地数据...';

      for (const storeName of stores) {
        const records = await new Promise(res => {
          const req = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
          req.onsuccess = e => res(e.target.result);
        });

        if (storeName === 'assets') {
          for (const record of records) {
            payload.assets_meta.push({
              key: record.key, mimeType: record.mimeType, size: record.size, updatedAt: record.updatedAt
            });
            assetsToUpload.push(record);
          }
        } else {
          payload[storeName] = records;
        }
      }

      btn.innerHTML = '<i class="ph-light ph-spinner" style="animation:spin 1s linear infinite"></i> 上传神经突触...';
      const { error: dbErr } = await supabase
        .from('chill_sync')
        .upsert({ id: 'main_backup', data: payload, updated_at: new Date() });
      if (dbErr) throw new Error(dbErr.message);

      let current = 0;
      const total = assetsToUpload.length;
      for (const record of assetsToUpload) {
        current++;
        btn.innerHTML = `<i class="ph-light ph-spinner" style="animation:spin 1s linear infinite"></i> 刻录媒体 (${current}/${total})`;
        const { error: storageErr } = await supabase.storage.from('chill_assets').upload(record.key, record.blob, { upsert: true, contentType: record.mimeType });
        if (storageErr) console.warn(`图片上传失败[${record.key}]:`, storageErr);
      }

      Toast.show('✦ 云端连结完毕，档案已永存 ✦');
    } catch(e) {
      console.error(e);
      Toast.show('上传失败: ' + e.message);
    } finally {
      btn.innerHTML = oriText;
      btn.style.pointerEvents = 'auto';
    }
  }

  async function syncDown() {
    const supabase = _getSupabase();
    if (!supabase) return;

    const confirmed = await _showCloudConfirm('Pull from Cloud', '警告：从云端拉取将完全覆盖当前设备上的所有数据！<br>确定执行吗？', '确认拉取');
    if (!confirmed) return;

    const btn = document.getElementById('btn-sync-down');
    const oriText = btn.innerHTML;
    btn.style.pointerEvents = 'none';

    try {
      btn.innerHTML = '<i class="ph-light ph-spinner" style="animation:spin 1s linear infinite"></i> 连接数据库...';
      
      const { data: syncRecords, error: dbErr } = await supabase
        .from('chill_sync')
        .select('data')
        .eq('id', 'main_backup')
        .single(); 

      if (dbErr || !syncRecords || !syncRecords.data) throw new Error('未在云端找到备份数据');
      const cloudData = syncRecords.data;

      await DB.clearAll();
      const db = await _getRawDB();
      const stores = Array.from(db.objectStoreNames);

      const assetsMeta = cloudData.assets_meta ||[];
      const total = assetsMeta.length;
      let current = 0;

      if (total > 0) {
        for (const meta of assetsMeta) {
          current++;
          btn.innerHTML = `<i class="ph-light ph-spinner" style="animation:spin 1s linear infinite"></i> 提取媒体 (${current}/${total})`;
          
          const { data: blobData, error: dlErr } = await supabase.storage.from('chill_assets').download(meta.key);
            
          if (blobData && !dlErr) {
            await new Promise((resolve, reject) => {
              const tx = db.transaction('assets', 'readwrite');
              const store = tx.objectStore('assets');
              store.put({ key: meta.key, blob: blobData, mimeType: meta.mimeType, size: meta.size, updatedAt: meta.updatedAt });
              tx.oncomplete = () => resolve();
              tx.onerror = () => reject(tx.error);
            });
          }
        }
      }

      btn.innerHTML = '<i class="ph-light ph-spinner" style="animation:spin 1s linear infinite"></i> 构建索引...';
      for (const storeName of stores) {
        if (storeName === 'assets') continue; 
        if (cloudData[storeName] && cloudData[storeName].length > 0) {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          for (const item of cloudData[storeName]) store.put(item);
          await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
        }
      }

      Toast.show('✦ 数据重载完毕！系统即将重启 ✦');
      setTimeout(() => location.reload(), 1500);

    } catch(e) {
      console.error(e);
      Toast.show('拉取失败: ' + e.message);
    } finally {
      btn.innerHTML = oriText;
      btn.style.pointerEvents = 'auto';
    }
  }
  
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function requestPushPermission() {
    const vapidInput = document.getElementById('vapid-key').value.trim();
    if (!vapidInput) { Toast.show('请先填写 VAPID 推送公钥'); return; }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) { Toast.show('当前浏览器不支持系统级推送'); return; }
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { Toast.show('通知授权被拒绝，离线 Agent 无法工作'); return; }

    Toast.show('正在生成端对端加密通信令牌...', 3000);

    try {
      await DB.settings.set('cloud-vapid', vapidInput);
      const reg = await navigator.serviceWorker.ready;
      
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidInput)
        });
      }

      const subData = JSON.parse(JSON.stringify(subscription));
      await DB.settings.set('push-subscription', subData);
      Toast.show('设备令牌生成成功！信使已就位 ✦');
      
      reg.showNotification('Chill OS', {
        body: '神经链路对接完成，设备加密令牌已锁定。',
        icon: 'apple-touch-icon.png'
      });

    } catch (e) {
      console.error('[Push] 订阅失败:', e);
      Toast.show('生成设备令牌失败，请检查公钥格式是否正确');
    }
  }

  // ============================================================
  // 🌟 核心：静默收取离线消息 (阅后即焚)
  // ============================================================
  async function checkOfflineMessages() {
    const supabase = await _getSupabaseSilent();
    if (!supabase) return;

    try {
      // 1. 查询收发室有没有新信件
      const { data: offlineMsgs, error } = await supabase
        .from('cloud_offline_messages')
        .select('*');
        
      if (error || !offlineMsgs || offlineMsgs.length === 0) return;

      console.log(`[Cloud] 📥 发现 ${offlineMsgs.length} 组离线消息，开始静默收取...`);

      for (const record of offlineMsgs) {
        const charId = record.char_id;
        const bubbles = record.content ||[];
        let timestamp = new Date(record.created_at).getTime();

        for (const text of bubbles) {
          let displayContent = text;
          let msgParts =[{ type: 'text', content: text }];
          
          // 兼容基础的标签解析 (音频和表情)
          const audioMatch = text.match(/^\[AUDIO:(\d+):(.+)\]$/s);
          const emoteMatch = text.match(/^\[EMOTE:(.+)\]$/i);
          
          if (audioMatch) {
            msgParts = [{ type: 'audio', duration: parseInt(audioMatch[1]), transcript: audioMatch[2].trim() }];
            displayContent = `[语音消息 ${audioMatch[1]}秒]`;
          } else if (emoteMatch) {
            const keyword = emoteMatch[1].trim();
            if (typeof EmoteModule !== 'undefined') {
              const url = EmoteModule.getUrlByKeyword(keyword, charId);
              if (url) {
                msgParts = [{ type: 'image', url: url, description: `[表情包:${keyword}]` }];
                displayContent = `[表情包]`;
              } else {
                msgParts = [{ type: 'text', content: `*试图发送表情包：${keyword}*` }];
              }
            }
          }

          const msg = {
            charId: String(charId),
            role: 'assistant',
            parts: msgParts,
            content: displayContent,
            timestamp: timestamp++, // 错开 1ms，确保数组顺序
            status: 'sent',
            recalled: false,
            recallContent: '',
            recallThought: '',
            recallNewMsg: ''
          };

          const newId = await DB.messages.add(msg);
          msg.id = newId;

          // 2. 如果用户恰好停留在该角色的聊天页（或处于半屏快回），原地静默插入 DOM
          if (typeof ConvModule !== 'undefined') {
            const screen = document.getElementById('conv-screen');
            if (screen && (screen.classList.contains('active') || screen.classList.contains('qr-active')) && screen.dataset.cvCharId === String(charId)) {
               // 利用底层 API 将其上屏
               if (ConvModule._appendNovelImageMessage) {
                 ConvModule._appendNovelImageMessage(msg).catch(()=>{});
               }
            }
          }
        }

        // 3. 收取完毕，焚毁云端信件 (彻底解决同步覆盖冲突问题)
        await supabase.from('cloud_offline_messages').delete().eq('id', record.id);
        console.log(`[Cloud] 🗑️ 离线信件 ${record.id} 已落库并销毁。`);
        
        // 4. 刷新该角色的最后交互时间，防止本地 Agent 立刻启动“夺命连环 Call”
        await DB.settings.set(`last-interaction-${charId}`, Date.now());
      }

      // 5. 收件结束，刷新桌面小红点
      if (typeof NotifModule !== 'undefined') NotifModule.refresh();

    } catch (e) {
      console.error('[Cloud] 离线消息收取失败:', e);
    }
  }

  // ── 初始化挂载 ──
  async function init() {
    // 首次加载系统时（如手动点通知进来的）查一次水表
    await checkOfflineMessages();
    
    // 监听应用切回前台事件（从息屏返回、从后台划回时自动检查）
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkOfflineMessages();
      }
    });
  }

  return { init, open, close, syncUp, syncDown, requestPushPermission };
})();

window.CloudModule = CloudModule;

// 在文件末尾确保加载时执行初始化
setTimeout(() => {
    if (CloudModule.init) CloudModule.init();
}, 1000);