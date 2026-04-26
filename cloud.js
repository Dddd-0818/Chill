'use strict';

/**
 * ============================================================
 * CloudModule — Supabase 云原生同步引擎 (高定视觉版)
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
    }
    [data-theme="dark"] #cloud-screen .cloud-hint-box {
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
              <button class="btn-outline" style="width:100%; border-color:#121212; color:#121212;" onclick="CloudModule.requestPushPermission()">
                <i class="ph-bold ph-bell-ringing"></i> 允许发送系统通知
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
  
  // Fix: PWA 离线加载极快，DOMContentLoaded 可能已经触发，用 readyState 兜底
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

  async function open() {
    try {
      const savedUrl = await DB.settings.get('cloud-url');
      const savedKey = await DB.settings.get('cloud-key');
      if (savedUrl) document.getElementById('cloud-url').value = savedUrl;
      if (savedKey) document.getElementById('cloud-key').value = savedKey;
    } catch(e) {}
    document.getElementById('cloud-screen').classList.add('active');
  }

  function close() {
    document.getElementById('cloud-screen').classList.remove('active');
  }

  // ── 独立内置的高定危险弹窗 ──
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

  // ── 上传到 Supabase (Sync Up) ──
  async function syncUp() {
    const supabase = _getSupabase();
    if (!supabase) return;

    // 为了防止误触覆盖掉云端的珍贵备份，给上传也加个弹窗！
    const confirmed = await _showCloudConfirm(
      'Push to Cloud', 
      '警告：上传将完全覆盖云端现有的备份数据。<br>确定要执行上传吗？', 
      '确认覆盖'
    );
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

  // ── 从 Supabase 拉取 (Sync Down) ──
  async function syncDown() {
    const supabase = _getSupabase();
    if (!supabase) return;

    // 使用我们刚写的、绝对不会被拦截的高定弹窗
    const confirmed = await _showCloudConfirm(
      'Pull from Cloud', 
      '警告：从云端拉取将完全覆盖当前设备上的所有数据！<br>确定执行吗？', 
      '确认拉取'
    );
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

      // ✅ 这是修复后的代码
      if (total > 0) {
        for (const meta of assetsMeta) {
          current++;
          btn.innerHTML = `<i class="ph-light ph-spinner" style="animation:spin 1s linear infinite"></i> 提取媒体 (${current}/${total})`;
          
          // 1. 先下载，不占着数据库通道
          const { data: blobData, error: dlErr } = await supabase
            .storage
            .from('chill_assets')
            .download(meta.key);
            
          if (blobData && !dlErr) {
            // 2. 下载完后，开启一个“快闪”事务，存完立刻关门
            await new Promise((resolve, reject) => {
              const tx = db.transaction('assets', 'readwrite');
              const store = tx.objectStore('assets');
              const request = store.put({
                key: meta.key, 
                blob: blobData, 
                mimeType: meta.mimeType,
                size: meta.size, 
                updatedAt: meta.updatedAt
              });
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
  
  // ── 请求系统通知权限 (带控制台追踪) ──
  async function requestPushPermission() {
    console.log('[Push] 🔘 按钮被点击了...');
    
    if (!('Notification' in window)) {
      console.error('[Push] ❌ 当前浏览器或壳子完全不支持 Notification API');
      Toast.show('当前环境不支持系统通知 (请尝试添加到桌面或换个浏览器)');
      return;
    }
    
    try {
      console.log('[Push] ⏳ 正在向系统申请权限...');
      const permission = await Notification.requestPermission();
      console.log('[Push] 📢 系统返回权限结果:', permission);
      
      if (permission === 'granted') {
        Toast.show('通知授权成功！信使已就位 ✦');
        // 测试弹一条通知
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification('Chill OS', {
              body: '神经链路对接完成，以后我会在这里找你。',
              icon: 'apple-touch-icon.png'
            });
            console.log('[Push] ✅ 测试通知已触发');
          });
        } else {
          console.warn('[Push] ⚠️ SW未接管页面，请刷新页面再试');
          Toast.show('请刷新一次页面使信使接管');
        }
      } else {
        Toast.show('授权被拒绝，无法发送通知');
      }
    } catch (err) {
      console.error('[Push] ❌ 请求权限时发生异常:', err);
      Toast.show('请求权限出错，详见控制台');
    }
  }

  return { open, close, syncUp, syncDown, requestPushPermission };
})();

// Fix: 确保 inline onclick="CloudModule.xxx()" 在任何加载方式下都能找到它
window.CloudModule = CloudModule;