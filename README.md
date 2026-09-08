# 🌍 智慧旅遊行程規劃助手 (Smart Travel Planner)

一個輕量、流暢、支援離線與 Firebase 即時雲端同步的現代化旅遊行程規劃 Web 應用程式。

---

## ✨ 核心特色

- ✈️ **多目的地分頁管理**：可隨時新增、重新命名或刪除不同國家與城市的旅遊計畫（內建各大洲 Emoji 標籤庫）。
- 📍 **景點收藏與標籤庫**：支援自訂城市分區、類型標籤、營業時間智慧格式化、地址與備註。
- 🗓️ **直覺式拖曳排程**：支援跨天數、時段的自由拖曳排序，規劃行程得心應手。
- ☁️ **Firebase 雙向雲端同步**：多裝置（手機、平板、電腦）即時同步，並內建離線快取機制。
- 🔒 **檢視與編輯權限保護**：預設為安全唯讀檢視模式，輸入通行密碼後即可解鎖新增、編輯與刪除權限。
- 💾 **本地備份與還原**：支援將全部資料或單一行程匯出為 JSON 檔案，資料永不遺失。

---

## 💻 系統需求

- **執行環境**：純前端靜態架構，**無需安裝 Node.js、Python 或任何後端伺服器**。
- **支援瀏覽器**：任何現代主流瀏覽器（Google Chrome、Microsoft Edge、Safari、Firefox），支援桌面與行動裝置（RWD 響應式排版）。

---

## 🚀 快速安裝與使用方式

### 方式一：本機直接開啟（最簡單）
1. 下載或 Clone 本專案所有檔案至本機。
2. 確保資料夾中包含 **`index.html`** 與 **`notion_data.js`**。
3. 直接以瀏覽器雙擊開啟 `index.html` 即可開始使用！
   *(若使用 VS Code，可搭配「Live Server」延伸模組點擊右下角 Go Live 開啟)*

### 方式二：部署至 GitHub Pages（免費線上雲端使用）
1. 在 GitHub 上建立一個新的儲存庫（Repository）。
2. 將以下檔案推送到根目錄：
   - `index.html`
   - `notion_data.js`
   - `README.md`（專案首頁說明）
3. 進入 GitHub Repository 的 **Settings** -> **Pages**。
4. 在 **Build and deployment** 來源處選擇 `Deploy from a branch`，Branch 選擇 `main`（或 `master`）/ `/(root)`，點擊 **Save**。
5. 稍等 1～2 分鐘，GitHub 便會提供一組專屬的線上網址，隨開隨用！

---

## 📁 檔案結構說明

| 檔案名稱 | 說明 |
| :--- | :--- |
| **`index.html`** | 核心單頁應用程式（包含 UI 介面、CSS 樣式設計、排程邏輯與 Firebase 同步代碼）。 |
| **`notion_data.js`** | 初始預設種子資料庫（提供首次載入或無網路時的預設景點與行程）。 |
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

## 🔐 安全性與權限注意事項

> [!IMPORTANT]
> - 預設解鎖通行密碼寫於 `index.html` 中的 `UNLOCK_PASSWORD` 常數。
> - 若您將儲存庫設為 **Public（公開）**，請務必先修改為您專屬的密碼，避免他人取得編輯權限。
