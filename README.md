# 🌍 智慧旅遊行程規劃助手 (Smart Travel Planner)

一個輕量、流暢、跨平台（桌面 / 手機 / PWA 應用程式），支援離線運作、Firebase 雙向即時雲端同步、旅伴公開投票與討論的現代化旅遊行程規劃系統。

![Version](https://img.shields.io/badge/version-4.2-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ 核心特色功能

### ✈️ 1. 多目的地分頁規劃
- 隨時新增、重新命名或刪除不同的旅遊計畫（如：東京、大阪、首爾、歐洲等）。
- 內建各大洲與特色分組的旅遊 Emoji 選單（亞洲、歐洲、美洲、非洲探險等），輕鬆標示旅程特色。
- 支援桌面端平滑水平滾動標籤列與手機端下拉式快速切換選單。

### 📍 2. 景點收藏庫與智慧格式化
- 支援景點名稱、城市/地區分區、自訂類型標籤（美食、購物、景點、住宿等）。
- **營業時間智慧排版**：自動辨識並整齊換行（星期一至日時間表一目了然）。
- 一鍵點擊「🗺️ 開啟地圖」直接呼叫 Google Maps 搜尋導航。

### 🗓️ 3. 直覺式拖曳排程
- 景點自由拖曳至行程天數與時段。
- 支援同一天行程順序自由微調，行程調整行雲流水。
- 具備造訪進度追蹤（✅ 已造訪 / ⬜ 未造訪）。

### 👥 4. 旅伴匿名簽到與身分識別（免帳密）
- 旅伴打開網頁即可點擊頂部 **`👤 旅伴簽到`**（或直接點擊任一景點的投票/留言）。
- 輸入小名（例如：小明、Luke），系統利用瀏覽器唯一識別碼（Device UUID）自動綁定至 `localStorage`。
- 頂部導航列常駐小名標籤，點擊隨時可更換小名，既有投票與留言自動連動。

### 👍 5. 景點公開具名投票與即時名單
- 景點卡片配備 **`👍 想去`** 與 **`👎 沒興趣`** 向量膠囊按鈕。
- 點擊即投出意向，再次點擊相同按鈕可「收回投票」，點擊另一按鈕自動「切換傾向」。
- 點擊 **`👥 名單`** 按鈕，抽屜式展開公開顯示具名清單（例如：`👍 想去 (2)：小明、Luke`）。

### 💬 6. 強制先投票才能評論機制（Gated Discussion）
- 點擊 **`💬 討論`** 展開/收合景點討論板。
- **門檻防護**：若旅伴尚未投票，留言框鎖定並提示：  
  `🔒 請先完成上方「👍 想去」或「👎 沒興趣」投票，即可發表評論與旅伴討論！`
- 完成投票後即時解鎖留言輸入框，大幅促進旅伴參與投票與互動。

### ✏️ 7. 評論本人再編輯與時間戳記
- 每則留言公開呈現發言者小名、發布時間與留言內容。
- **本人專屬操作**：本人發表的留言具備 **`✏️ 編輯`** 與 **`🗑️ 刪除`** 操作：
  - 點擊 **`✏️ 編輯`** 直接轉換為行內文字編輯框，修改後儲存即更新，並公開標記 **`(已編輯 09/10 16:45)`**。
  - 本人亦可隨時移除自己的留言。

### ☁️ 8. Firebase 雙向即時雲端同步
- 多裝置（手機、平板、電腦）即時聯網同步，一人點讚或留言，所有在線旅伴畫面**即刻連動跳動更新**。
- **唯讀使用者支援**：旅伴無需輸入管理密碼，也能自由投票、留言、編輯自己的評論並即時推播至雲端。
- 具備防抖（Debounce）機制與斷線自動重連，連線狀態即時以呼吸燈徽章呈現。

### 📱 9. PWA 漸進式 Web 應用程式支援
- 內建 `manifest.json` 與 `sw.js`（Service Worker v9 快取架構）。
- 可直接「新增至主畫面 / 安裝應用程式」，支援離線開啟、全螢幕原生 App 沉浸體驗。
- 行動端響應式介面（RWD）最佳化，觸控按鈕加大防止誤觸，輸入框防 Safari 自動縮放。

### 💾 10. 資料安全與備份還原
- 支援將全部旅遊資料或單一行程匯出為 JSON 檔案保存於本地。
- 管理員編輯功能（新增景點、拖曳行程、更動行程名稱）設有密碼防護，確保主行程不被意外篡改。

---

## 💻 系統需求

- **執行環境**：純前端靜態架構，**無需安裝 Node.js、Python、PHP 或後端資料庫伺服器**。
- **支援瀏覽器**：Google Chrome、Microsoft Edge、Safari、Firefox、Samsung Internet 等所有現代瀏覽器。
- **支援裝置**：桌面電腦 (Windows / macOS / Linux)、平板、智慧型手機 (iOS / Android)。

---

## 🚀 安裝與使用方式

### 方式一：本機直接開啟（最簡便）
1. 下載或 Clone 本專案所有檔案至本機。
2. 確保資料夾中包含核心檔案（`index.html`、`notion_data.js`、`manifest.json`、`sw.js`）。
3. 直接以瀏覽器雙擊開啟 `index.html` 即可開始使用！
   *(若使用 VS Code，可搭配「Live Server」延伸模組點擊右下角 Go Live 開啟)*

### 方式二：部署至 GitHub Pages（推薦線上雲端共享）
1. 在 GitHub 上建立一個儲存庫（Repository）。
2. 將本專案所有檔案推送到 GitHub 根目錄。
3. 進入 GitHub Repository 的 **Settings** ➡️ **Pages**。
4. 在 **Build and deployment** 的 Branch 選擇 `main`（或 `master`）/ `/(root)`，點擊 **Save**。
5. 稍候 1～2 分鐘，GitHub 即會提供一組公開網址，將網址傳給旅伴即可一起規劃與投票！

### 方式三：安裝為手機 / 桌面 App (PWA)
1. 使用手機瀏覽器（iOS Safari 或 Android Chrome）打開線上網址。
2. 點擊瀏覽器選單中的 **「加入主畫面」** 或 **「安裝應用程式」**。
3. 桌面即會出現專屬圖示，點開即可像原生 App 一樣離線運作並享有全螢幕體驗。

---

## 📁 檔案結構說明

| 檔案名稱 | 說明 |
| :--- | :--- |
| **`index.html`** | 核心單頁應用程式（包含 UI 介面、CSS 設計、排程演算法、旅伴社交互動與 Firebase 同步代碼）。 |
| **`notion_data.js`** | 初始預設種子資料庫（提供首次載入或無網路時的預設景點與行程）。 |
| **`manifest.json`** | PWA Web App 清單設定（定義 App 名稱、主題色、圖標與啟動模式）。 |
| **`sw.js`** | Service Worker 離線快取腳本（Network-First 策略，支援無網路環境使用）。 |
| **`images.png` / `apple-touch-icon.png`** | Web App 與 iOS 桌面圖標。 |
| **`README.md`** | 專案說明文件（本文件）。 |

---

## ⚙️ 雲端同步配置 (Firebase)

本專案採用 Firebase Realtime Database 進行跨裝置同步：
- 程式內已預先配置好連線設定。
- 若需更換為您個人的 Firebase 資料庫，請在 `index.html` 中的 `firebaseConfig` 物件填入您的專案金鑰：
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 🔐 權限與安全性說明

> [!IMPORTANT]
> - **管理員解鎖密碼**：設定於 `index.html` 中的 `UNLOCK_PASSWORD` 常數，用於解鎖行程編輯、刪除景點與拖曳排程權限。
> - **旅伴操作無需密碼**：旅伴簽到、景點投票、發表評論與編輯自己留言等互動功能，在唯讀模式下皆可自由使用。
> - 若將儲存庫設為 **Public（公開）**，建議修改 `UNLOCK_PASSWORD` 為您專屬的密碼。
