/**
 * ========================================================
 * 實用旅行助手擴充外掛 (Travel Assistant Add-on)
 * 專為現有智慧旅遊行程系統打造之非侵入式外掛模組
 * 提供：
 * 1. 多國語言小卡 (日/韓/英獨立分頁)
 * 2. 全球 10 大幣別自動連網即時匯率換算 (以新台幣1元為主基底 1 TWD = X 外幣)
 *    支援：日圓 (JPY) / 韓元 (KRW) / 美金 (USD) / 歐元 (EUR) / 英鎊 (GBP)
 *          澳幣 (AUD) / 加幣 (CAD) / 瑞士法郎 (CHF) / 人民幣 (CNY) / 港幣 (HKD)
 * 3. 台灣銀行 / Google 官方匯率查詢捷徑
 * 4. 旅伴即時平攤分帳
 * 5. 外部 App 智慧串聯 (地圖/官方系統)
 * ========================================================
 */

(function () {
  'use strict';

  // 外掛核心管理器
  window.TravelAssistantAddon = {
    // 幣別配置 (支援 10 大熱門貨幣)
    currencies: {
      JPY: { name: "日圓 (JPY)", flag: "🇯🇵", symbol: "¥", defaultTwdBase: 4.89, defaultVal: 1000, defaultSplit: 6500 },
      KRW: { name: "韓元 (KRW)", flag: "🇰🇷", symbol: "₩", defaultTwdBase: 43.14, defaultVal: 50000, defaultSplit: 120000 },
      USD: { name: "美金 (USD)", flag: "🇺🇸", symbol: "$", defaultTwdBase: 0.0314, defaultVal: 50, defaultSplit: 200 },
      EUR: { name: "歐元 (EUR)", flag: "🇪🇺", symbol: "€", defaultTwdBase: 0.0273, defaultVal: 50, defaultSplit: 150 },
      GBP: { name: "英鎊 (GBP)", flag: "🇬🇧", symbol: "£", defaultTwdBase: 0.0234, defaultVal: 50, defaultSplit: 120 },
      AUD: { name: "澳幣 (AUD)", flag: "🇦🇺", symbol: "A$", defaultTwdBase: 0.0442, defaultVal: 100, defaultSplit: 200 },
      CAD: { name: "加幣 (CAD)", flag: "🇨🇦", symbol: "C$", defaultTwdBase: 0.0439, defaultVal: 100, defaultSplit: 200 },
      CHF: { name: "瑞士法郎 (CHF)", flag: "🇨🇭", symbol: "CHF", defaultTwdBase: 0.0258, defaultVal: 50, defaultSplit: 150 },
      CNY: { name: "人民幣 (CNY)", flag: "🇨🇳", symbol: "¥", defaultTwdBase: 0.2107, defaultVal: 500, defaultSplit: 1000 },
      HKD: { name: "港幣 (HKD)", flag: "🇭🇰", symbol: "HK$", defaultTwdBase: 0.2466, defaultVal: 500, defaultSplit: 1200 }
    },

    // 以新台幣 1 元 (1 TWD) 為基準的外幣匯率
    twdBaseRates: {
      JPY: 4.89,
      KRW: 43.14,
      USD: 0.0314,
      EUR: 0.0273,
      GBP: 0.0234,
      AUD: 0.0442,
      CAD: 0.0439,
      CHF: 0.0258,
      CNY: 0.2107,
      HKD: 0.2466
    },

    currentCurrency: 'JPY',
    rateStatus: 'loading', // loading | live | cached
    lastUpdateTime: '',

    init() {
      this.loadStorage();
      this.injectUI();
      this.bindEvents();
      // 每次開啟時，自動連網取得當日最新即時匯率 (以 1 TWD 為基底)
      this.fetchLiveRates();
      console.log('✅ TravelAssistantAddon 實用旅行助手外掛已成功掛載！(支援 10 大幣別)');
    },

    loadStorage() {
      try {
        const savedRates = localStorage.getItem('addon_twd_base_rates');
        if (savedRates) {
          this.twdBaseRates = Object.assign(this.twdBaseRates, JSON.parse(savedRates));
        }
        const savedCurr = localStorage.getItem('addon_current_currency');
        if (savedCurr && this.currencies[savedCurr]) {
          this.currentCurrency = savedCurr;
        }
        const savedTime = localStorage.getItem('addon_rate_update_time');
        if (savedTime) {
          this.lastUpdateTime = savedTime;
          this.rateStatus = 'cached';
        }
      } catch (e) {
        console.error(e);
      }
    },

    // 自動連網非同步抓取當日最新即時匯率 (以 1 TWD 為基準)
    async fetchLiveRates() {
      this.rateStatus = 'loading';
      this.updateRateStatusDisplay();

      try {
        const res = await fetch('https://open.er-api.com/v6/latest/TWD');
        if (!res.ok) throw new Error('匯率 API 回應異常');
        const data = await res.json();

        if (data && data.rates) {
          for (const code of Object.keys(this.currencies)) {
            if (data.rates[code]) {
              this.twdBaseRates[code] = parseFloat(data.rates[code].toFixed(4));
            }
          }

          const now = new Date();
          this.lastUpdateTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          this.rateStatus = 'live';

          // 寫入本地快取，即使無網路亦能自動使用最後最新值
          localStorage.setItem('addon_twd_base_rates', JSON.stringify(this.twdBaseRates));
          localStorage.setItem('addon_rate_update_time', this.lastUpdateTime);

          // 若使用者正在匯率面板，動態平滑更新數值與計算結果，不清除使用者已輸入文字
          this.updateRateStatusDisplay();
          const baseValEl = document.getElementById('ta-twd-base-val');
          if (baseValEl) {
            baseValEl.textContent = this.twdBaseRates[this.currentCurrency];
            this.updateCurrencyCalc();
            this.updateSplitCalc();
          }
        }
      } catch (err) {
        console.warn('⚠️ 即時匯率更新失敗，自動採用快取/基準數值:', err);
        this.rateStatus = 'cached';
        this.updateRateStatusDisplay();
      }
    },

    updateRateStatusDisplay() {
      const badge = document.getElementById('ta-rate-status-badge');
      if (!badge) return;
      if (this.rateStatus === 'loading') {
        badge.innerHTML = `<span style="color:#f59e0b;">⏳ 更新匯率中...</span>`;
      } else if (this.rateStatus === 'live') {
        badge.innerHTML = `<span style="color:#10b981; font-weight:700;">🟢 今日即時匯率 (已更新 ${this.lastUpdateTime})</span>`;
      } else {
        badge.innerHTML = `<span style="color:#94a3b8;">🟡 離線匯率 (${this.lastUpdateTime || '預設值'})</span>`;
      }
    },

    // 動態將 DOM 注入到現有頁面 (零修改原頁面主體)
    injectUI() {
      // (1) 注入右下角懸浮按鈕 (FAB)
      if (!document.getElementById('ta-fab-btn')) {
        const fab = document.createElement('button');
        fab.id = 'ta-fab-btn';
        fab.className = 'ta-fab-btn';
        fab.title = '開啟旅行助手 (多國語言小卡 / 匯率分帳)';
        fab.innerHTML = `<span>🌐</span><span class="ta-fab-badge">助手</span>`;
        fab.onclick = () => this.openModal('cards');
        document.body.appendChild(fab);
      }

      // (2) 注入側邊欄選項 (若側邊欄存在)
      const sidebarNav = document.querySelector('.sidebar .nav-content');
      if (sidebarNav && !document.getElementById('addon-sidebar-group')) {
        const group = document.createElement('div');
        group.id = 'addon-sidebar-group';
        group.className = 'category-group';
        group.innerHTML = `
          <div class="category-header">實用旅行小助手</div>
          <div class="nav-item" onclick="if (typeof closeSidebar==='function') closeSidebar(); window.open('language_cards.html', '_blank')">
            <span class="icon">🌐</span><span class="label">多國語言小卡 (日/韓/英) ↗</span>
          </div>
          <div class="nav-item" onclick="TravelAssistantAddon.openModal('calc')">
            <span class="icon">💱</span><span class="label">即時匯率與分帳 (全球 10 大幣別)</span>
          </div>
          <div class="nav-item" onclick="TravelAssistantAddon.openModal('apps')">
            <span class="icon">📱</span><span class="label">串聯外部 App (地圖/官方)</span>
          </div>
        `;
        // 插入在第一個工作台下方
        const firstGroup = sidebarNav.querySelector('.category-group');
        if (firstGroup && firstGroup.nextSibling) {
          sidebarNav.insertBefore(group, firstGroup.nextSibling);
        } else {
          sidebarNav.appendChild(group);
        }
      }

      // (3) 注入主模態視窗 (Modal)
      if (!document.getElementById('ta-main-modal')) {
        const modal = document.createElement('div');
        modal.id = 'ta-main-modal';
        modal.className = 'ta-modal-backdrop';
        modal.innerHTML = `
          <div class="ta-modal-box">
            <div class="ta-modal-header">
              <div class="ta-modal-title">
                <span id="ta-header-icon">🌐</span>
                <span id="ta-header-text">多國語言小卡 (日語 / 韓語 / 英語)</span>
              </div>
              <button class="ta-modal-close-btn" onclick="TravelAssistantAddon.closeModal()">✕</button>
            </div>

            <div class="ta-nav-tabs">
              <button class="ta-tab-btn active" data-tab="cards" onclick="TravelAssistantAddon.switchTab('cards')">
                <span>🌐</span> 多國語言小卡
              </button>
              <button class="ta-tab-btn" data-tab="calc" onclick="TravelAssistantAddon.switchTab('calc')">
                <span>💱</span> 即時匯率分帳 (10大幣別)
              </button>
              <button class="ta-tab-btn" data-tab="apps" onclick="TravelAssistantAddon.switchTab('apps')">
                <span>📱</span> 串聯 App
              </button>
            </div>

            <div class="ta-modal-body" id="ta-modal-content">
              <!-- 動態內容由 switchTab 渲染 -->
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
    },

    openModal(tab = 'cards') {
      const modal = document.getElementById('ta-main-modal');
      if (modal) {
        modal.classList.add('active');
        this.switchTab(tab);
      }
      if (typeof closeSidebar === 'function') {
        try { closeSidebar(); } catch (e) {}
      }
    },

    closeModal() {
      const modal = document.getElementById('ta-main-modal');
      if (modal) modal.classList.remove('active');
    },

    switchTab(tab) {
      document.querySelectorAll('.ta-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tab) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      const headerIcon = document.getElementById('ta-header-icon');
      const headerText = document.getElementById('ta-header-text');
      const body = document.getElementById('ta-modal-content');
      if (!body) return;

      if (tab === 'cards' || tab === 'japanese') {
        if (headerIcon) headerIcon.textContent = '🌐';
        if (headerText) headerText.textContent = '多國語言小卡 (日語 / 韓語 / 英語)';
        this.renderCardsTab(body);
      } else if (tab === 'calc') {
        if (headerIcon) headerIcon.textContent = '💱';
        if (headerText) headerText.textContent = '多幣別即時匯率換算與分帳計算';
        this.renderCalcTab(body);
        // 每次切換至匯率分頁時，自動連網檢查並更新當日最新牌告匯率
        this.fetchLiveRates();
      } else if (tab === 'apps') {
        if (headerIcon) headerIcon.textContent = '📱';
        if (headerText) headerText.textContent = '外部 App 智慧串聯 (地圖/官方系統)';
        this.renderAppsTab(body);
      }
    },

    // 渲染：多國語言小卡分頁 (僅保留獨立全螢幕分頁跳轉卡片)
    renderCardsTab(container) {
      container.innerHTML = `
        <!-- 多國語言新分頁跳轉快捷卡片 -->
        <div style="background:linear-gradient(135deg, rgba(139,92,246,0.14), rgba(14,165,233,0.14)); border:1.5px solid #8b5cf6; border-radius:18px; padding:28px 20px; text-align:center; box-shadow:0 6px 20px rgba(139,92,246,0.15); margin:10px 0 20px;">
          <div style="font-size:2.6rem; margin-bottom:8px;">🌐</div>
          <div style="font-weight:800; font-size:1.18rem; color:var(--text-main); margin-bottom:8px;">多國語言旅行小卡</div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:20px; line-height:1.6;">
            已為您整合 🇯🇵 日語 / 🇰🇷 韓語 / 🇺🇸 英語 三國語言<br>
            完整支援情境左右滑動、動態組句、真人語音發音與全螢幕大字出示！
          </div>
          <button class="ta-btn-sm ta-btn-primary" style="padding:12px 24px; font-size:0.95rem; font-weight:700; width:100%; justify-content:center; box-shadow:0 6px 18px rgba(139,92,246,0.3);" onclick="window.open('language_cards.html', '_blank')">
            🚀 開啟獨立分頁 (全螢幕多語言溝通模式) ↗
          </button>
        </div>
      `;
    },

    // 渲染：多幣別即時匯率換算與分帳分頁 (以新台幣 1 元為主基底顯示)
    renderCalcTab(container) {
      const curr = this.currentCurrency;
      const currInfo = this.currencies[curr] || this.currencies.JPY;
      const twdBaseRate = this.twdBaseRates[curr] || currInfo.defaultTwdBase; // 1 TWD = X 外幣
      const inverseRate = (1 / twdBaseRate).toFixed(4); // 1 外幣 = Y TWD

      // 動態產生幣別下拉選單選項
      const currOptionsHtml = Object.entries(this.currencies).map(([code, info]) => {
        return `<option value="${code}" ${curr === code ? 'selected' : ''}>${info.flag} ${info.name}</option>`;
      }).join('');

      container.innerHTML = `
        <div class="ta-calc-card">
          <!-- 頂部幣別切換與更新狀態 -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div>
              <div style="font-weight:800; font-size:0.95rem; color:var(--text-main);">💱 即時外幣換算 ⇄ 新台幣</div>
              <div id="ta-rate-status-badge" style="font-size:0.72rem; margin-top:2px;"></div>
            </div>
            <select id="ta-curr-select" class="ta-input-field" style="width:auto; padding:5px 12px; font-size:0.84rem; font-weight:700;" onchange="TravelAssistantAddon.onCurrencyChange(this.value)">
              ${currOptionsHtml}
            </select>
          </div>

          <!-- 核心基準匯率展示：以新台幣 1 元 (1 TWD) 為主顯示 -->
          <div style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); border-radius:12px; padding:10px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted);">基準匯率 (以新台幣 1 元計)：</div>
              <div style="font-size:1.1rem; font-weight:900; color:var(--accent);">
                1 TWD ≈ <span id="ta-twd-base-val">${twdBaseRate}</span> ${curr}
              </div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top:1px;">
                (反向參考：1 ${curr} ≈ ${inverseRate} TWD)
              </div>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="ta-btn-sm" onclick="TravelAssistantAddon.fetchLiveRates()" title="重新抓取最新牌價" style="padding:4px 8px; font-size:0.75rem;">🔄 更新</button>
              <button class="ta-btn-sm" onclick="TravelAssistantAddon.promptCustomRate()" title="手動設定匯率" style="padding:4px 8px; font-size:0.75rem;">自訂</button>
            </div>
          </div>

          <!-- 換算輸入欄 -->
          <div class="ta-input-row">
            <div style="flex:1; position:relative;">
              <input type="number" id="ta-calc-foreign" class="ta-input-field" style="width:100%; padding-right:56px;" placeholder="輸入金額" value="${currInfo.defaultVal}" oninput="TravelAssistantAddon.updateCurrencyCalc()">
              <span id="ta-calc-symbol-tag" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:800; color:var(--text-muted);">${curr}</span>
            </div>
            <span style="font-weight:800; font-size:1.1rem;">≈</span>
            <div id="ta-calc-twd" class="ta-input-field" style="background:rgba(255,255,255,0.06); display:flex; align-items:center;">
              NT$ ${Math.round(currInfo.defaultVal / twdBaseRate).toLocaleString()}
            </div>
          </div>

          <!-- 匯率官網外部查詢連結 -->
          <div style="margin-top:12px; padding-top:10px; border-top:1px dashed var(--border-color); display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span style="font-size:0.75rem; color:var(--text-muted);">🔗 匯率查詢官網：</span>
            <a href="https://rate.bot.com.tw/xrt?Lang=zh-TW" target="_blank" class="ta-btn-sm" style="text-decoration:none; color:var(--accent); font-weight:700;">
              🏦 台灣銀行牌告匯率 ↗
            </a>
            <a href="https://www.google.com/finance/quote/${curr}-TWD" id="ta-google-rate-link" target="_blank" class="ta-btn-sm" style="text-decoration:none; color:var(--accent); font-weight:700;">
              📈 Google 即時外匯 ↗
            </a>
          </div>
        </div>

        <!-- 旅伴快速平攤分帳 (自動換算新台幣) -->
        <div class="ta-calc-card">
          <div style="font-weight:800; margin-bottom:8px; font-size:0.92rem;">⚖️ 旅伴快速平攤分帳 (<span id="ta-split-curr-name">${currInfo.name}</span>)</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
            <div>
              <label style="font-size:0.75rem; color:var(--text-muted);">總花費 (<span id="ta-split-curr-code">${curr}</span>)</label>
              <input type="number" id="ta-split-foreign" class="ta-input-field" value="${currInfo.defaultSplit}" oninput="TravelAssistantAddon.updateSplitCalc()">
            </div>
            <div>
              <label style="font-size:0.75rem; color:var(--text-muted);">分攤人數</label>
              <input type="number" id="ta-split-people" class="ta-input-field" value="2" min="1" oninput="TravelAssistantAddon.updateSplitCalc()">
            </div>
          </div>
          <div id="ta-split-result" style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); border-radius:10px; padding:10px; text-align:center; font-size:0.86rem; font-weight:700; color:var(--accent);">
            每人應分攤：${currInfo.symbol}${(currInfo.defaultSplit / 2).toLocaleString()} (約 NT$ ${Math.round((currInfo.defaultSplit / 2) / twdBaseRate).toLocaleString()})
          </div>
        </div>
      `;

      this.updateRateStatusDisplay();
    },

    onCurrencyChange(curr) {
      if (!this.currencies[curr]) return;
      this.currentCurrency = curr;
      localStorage.setItem('addon_current_currency', curr);
      const body = document.getElementById('ta-modal-content');
      if (body) this.renderCalcTab(body);
    },

    updateCurrencyCalc() {
      const inputEl = document.getElementById('ta-calc-foreign');
      const twdEl = document.getElementById('ta-calc-twd');
      if (!inputEl || !twdEl) return;
      const curr = this.currentCurrency;
      const twdBaseRate = this.twdBaseRates[curr] || (this.currencies[curr] ? this.currencies[curr].defaultTwdBase : 1);
      const val = parseFloat(inputEl.value) || 0;
      const twd = Math.round(val / twdBaseRate);
      twdEl.textContent = `NT$ ${twd.toLocaleString()}`;
    },

    promptCustomRate() {
      const curr = this.currentCurrency;
      const currentTwdRate = this.twdBaseRates[curr] || (this.currencies[curr] ? this.currencies[curr].defaultTwdBase : 1);
      const newRate = prompt(`請輸入以【新台幣 1 元】為基底的自訂匯率 (例如 1 TWD 等於多少 ${curr}，目前為 ${currentTwdRate}):`, currentTwdRate);
      if (newRate && !isNaN(newRate) && parseFloat(newRate) > 0) {
        this.twdBaseRates[curr] = parseFloat(parseFloat(newRate).toFixed(4));
        localStorage.setItem('addon_twd_base_rates', JSON.stringify(this.twdBaseRates));
        const body = document.getElementById('ta-modal-content');
        if (body) this.renderCalcTab(body);
      }
    },

    updateSplitCalc() {
      const inputEl = document.getElementById('ta-split-foreign');
      const peopleEl = document.getElementById('ta-split-people');
      const resEl = document.getElementById('ta-split-result');
      if (!inputEl || !peopleEl || !resEl) return;

      const curr = this.currentCurrency;
      const currInfo = this.currencies[curr] || this.currencies.JPY;
      const twdBaseRate = this.twdBaseRates[curr] || currInfo.defaultTwdBase;

      const val = parseFloat(inputEl.value) || 0;
      const people = parseInt(peopleEl.value, 10) || 1;
      const perForeign = Math.round(val / people);
      const perTwd = Math.round(perForeign / twdBaseRate);

      resEl.textContent = `每人應分攤：${currInfo.symbol}${perForeign.toLocaleString()} (約 NT$ ${perTwd.toLocaleString()})`;
    },

    // 渲染：外部 App 串聯分頁
    renderAppsTab(container) {
      container.innerHTML = `
        <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:12px;">
          💡 點擊下方卡片即可直接在手機上喚起對應 App 或開啟官方線上系統：
        </div>

        <div class="ta-guide-box" style="cursor:pointer;" onclick="window.open('https://www.google.com/maps', '_blank')">
          <div class="ta-guide-header">
            <span>🗺️ Google Maps (地圖導航)</span>
            <span class="ta-btn-sm" style="padding:2px 8px; font-size:0.72rem;">開啟 App ›</span>
          </div>
          <div class="ta-guide-desc">日本/韓國/歐洲/美加/全球最準確的步行轉乘導航，地鐵出口與店家營業時間必備。</div>
        </div>

        <div class="ta-guide-box" style="cursor:pointer;" onclick="window.open('https://www.vjw.digital.go.jp/', '_blank')">
          <div class="ta-guide-header">
            <span>🇯🇵 Visit Japan Web (日本官方入境審查)</span>
            <span class="ta-btn-sm" style="padding:2px 8px; font-size:0.72rem;">登入系統 ›</span>
          </div>
          <div class="ta-guide-desc">日本數位廳官方入境手續申報，通關出示 QR Code。</div>
        </div>

        <div class="ta-guide-box" style="cursor:pointer;" onclick="window.open('https://tabelog.com/', '_blank')">
          <div class="ta-guide-header">
            <span>🍽️ 食べログ (Tabelog 日本美食聖經)</span>
            <span class="ta-btn-sm" style="padding:2px 8px; font-size:0.72rem;">探索名店 ›</span>
          </div>
          <div class="ta-guide-desc">日本在地食記評分權威，評分 3.5 分以上皆為保證名店。</div>
        </div>

        <div class="ta-guide-box" style="cursor:pointer;" onclick="window.open('https://www.navitime.co.jp/en/travel/', '_blank')">
          <div class="ta-guide-header">
            <span>🚄 Japan Travel by NAVITIME</span>
            <span class="ta-btn-sm" style="padding:2px 8px; font-size:0.72rem;">路線規劃 ›</span>
          </div>
          <div class="ta-guide-desc">外國觀光客鐵路神器，支援 JR Pass 與地鐵乘車券專屬路線查詢。</div>
        </div>

        <div class="ta-guide-box" style="cursor:pointer;" onclick="window.open('https://rate.bot.com.tw/xrt?Lang=zh-TW', '_blank')">
          <div class="ta-guide-header">
            <span>🏦 台灣銀行牌告匯率 (即時外匯)</span>
            <span class="ta-btn-sm" style="padding:2px 8px; font-size:0.72rem;">查看即時匯率 ›</span>
          </div>
          <div class="ta-guide-desc">即時查詢日圓、韓元、美金、歐元、英鎊等全球外幣現金買入/賣出最新即時牌價。</div>
        </div>
      `;
    },

    bindEvents() {
      // 點擊遮罩外圍關閉
      const modal = document.getElementById('ta-main-modal');
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.closeModal();
        });
      }

      // ESC 鍵關閉
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal();
        }
      });
    }
  };

  // 頁面載入後自動啟動外掛
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.TravelAssistantAddon.init());
  } else {
    window.TravelAssistantAddon.init();
  }
})();
