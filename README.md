<div align="center">

<img src="public/favicon.svg" width="80" alt="VideMove Logo" />

# 🎬 VideMove

**AI-Powered Browser Video Editor**

[![License: MIT](https://img.shields.io/badge/License-MIT-7c5cfc.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![GitHub Stars](https://img.shields.io/github/stars/ikirieyu/VideMove?style=social)](https://github.com/ikirieyu/VideMove)

*Edit videos directly in your browser — no install required.*

---

**[🇺🇸 English](#-english) · [🇮🇩 Indonesia](#-indonesia) · [🇨🇳 中文](#-中文) · [🇯🇵 日本語](#-日本語)**

</div>

---

## 🇺🇸 English

### What is VideMove?

**VideMove** is a professional, browser-based video editor powered by AI. It runs entirely in your browser — no installation, no server, no data uploaded anywhere. All processing is done locally on your device.

### ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Multi-Provider AI** | Supports 11 AI providers: OpenAI, Pollinations, Gemini, Groq, AiHubMix, AI/ML API, DeepSeek, Grok, Moonshot, MiniMax, Qwen |
| ✂️ **AI Auto-Cut** | Automatically finds the best clips from your video using AI analysis |
| 💬 **Subtitle Generation** | Transcribe speech to subtitles using Groq Whisper or Browser Speech API |
| 🎨 **Template System** | 6+ beautiful video templates optimized for TikTok, Instagram, YouTube, and more |
| 📐 **Layout Editor** | Real-time GUI controls for aspect ratio, subtitle position, font size, and colors |
| 📤 **FFmpeg Export** | Export trimmed video at custom resolution and quality — runs 100% locally |
| 🔒 **Privacy First** | API keys stored only in your browser's localStorage — never sent to any server |

### 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/ikirieyu/VideMove.git
cd VideMove

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open **http://localhost:5173** in your browser.

### 🔑 Setting Up AI Providers

1. Open the app and click the **⚙️ Settings** icon in the header
2. Go to the **🤖 AI Provider** tab
3. Select your preferred provider and enter your API key
4. Click **Save Settings**

> **Tip:** Pollinations AI works without an API key (free, limited). For best results, use OpenAI `gpt-4o-mini`.

### 📐 Layout Editor

1. Click the **Template** icon in the sidebar
2. Switch to the **📐 Layout** tab
3. Choose aspect ratio (16:9, 9:16, 1:1, 4:3, 21:9)
4. Adjust subtitle & title style in real-time

### 🛠 Tech Stack

- **Frontend:** React 18 + Vite 8
- **Styling:** Vanilla CSS with CSS variables (dark premium theme)
- **AI:** Universal multi-provider service (OpenAI-compatible + Gemini)
- **Video Processing:** FFmpeg.wasm (runs locally in-browser)
- **Fonts:** Inter + Outfit (Google Fonts)

---

## 🇮🇩 Indonesia

### Apa itu VideMove?

**VideMove** adalah editor video berbasis browser yang didukung kecerdasan buatan (AI). Berjalan sepenuhnya di browser kamu — tanpa instalasi, tanpa server, tanpa upload data ke manapun. Semua pemrosesan dilakukan secara lokal di perangkat kamu.

### ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🤖 **Multi-Provider AI** | Mendukung 11 provider AI: OpenAI, Pollinations, Gemini, Groq, AiHubMix, AI/ML API, DeepSeek, Grok, Moonshot, MiniMax, Qwen |
| ✂️ **AI Auto-Cut** | Otomatis menemukan klip terbaik dari video kamu menggunakan analisis AI |
| 💬 **Subtitle Otomatis** | Transkripsi ucapan ke subtitle menggunakan Groq Whisper atau Browser Speech API |
| 🎨 **Template Video** | 6+ template video indah yang dioptimalkan untuk TikTok, Instagram, YouTube, dll |
| 📐 **Layout Editor** | Kontrol GUI real-time untuk aspect ratio, posisi subtitle, ukuran font, dan warna |
| 📤 **Export FFmpeg** | Export video dengan resolusi dan kualitas custom — berjalan 100% lokal |
| 🔒 **Privasi Terjaga** | API key hanya disimpan di localStorage browser — tidak pernah dikirim ke server manapun |

### 🚀 Cara Menjalankan

```bash
# Clone repositori
git clone https://github.com/ikirieyu/VideMove.git
cd VideMove

# Install dependensi
npm install

# Jalankan server pengembangan
npm run dev
```

Buka **http://localhost:5173** di browser kamu.

### 🔑 Mengatur Provider AI

1. Buka aplikasi dan klik ikon **⚙️ Settings** di header
2. Masuk ke tab **🤖 AI Provider**
3. Pilih provider yang diinginkan dan masukkan API key
4. Klik **Save Settings**

> **Tips:** Pollinations AI bisa dipakai tanpa API key (gratis, terbatas). Untuk hasil terbaik, gunakan OpenAI `gpt-4o-mini`.

### 📐 Layout Editor

1. Klik ikon **Template** di sidebar
2. Pindah ke tab **📐 Layout**
3. Pilih aspect ratio (16:9, 9:16, 1:1, 4:3, 21:9)
4. Sesuaikan gaya subtitle & judul secara real-time

### 🛡 Keamanan

API key kamu **tidak pernah** dikirim ke server VideMove. Semua request AI dilakukan langsung dari browser kamu ke provider AI yang bersangkutan. Data video kamu tidak pernah meninggalkan perangkat kamu.

---

## 🇨🇳 中文

### 什么是 VideMove？

**VideMove** 是一款由人工智能驱动的浏览器视频编辑器。完全在浏览器中运行——无需安装、无需服务器、不上传任何数据。所有处理均在您的设备本地完成。

### ✨ 主要功能

| 功能 | 说明 |
|---|---|
| 🤖 **多 AI 提供商** | 支持 11 个 AI 提供商：OpenAI、Pollinations、Gemini、Groq、AiHubMix、AI/ML API、DeepSeek、Grok、Moonshot、MiniMax、Qwen |
| ✂️ **AI 自动剪辑** | 利用 AI 分析自动找到视频中最精彩的片段 |
| 💬 **自动生成字幕** | 使用 Groq Whisper 或浏览器语音 API 将语音转换为字幕 |
| 🎨 **视频模板** | 6+ 款精美视频模板，针对 TikTok、Instagram、YouTube 等平台优化 |
| 📐 **布局编辑器** | 实时 GUI 控制纵横比、字幕位置、字体大小和颜色 |
| 📤 **FFmpeg 导出** | 以自定义分辨率和质量导出视频——100% 本地运行 |
| 🔒 **隐私优先** | API 密钥仅存储在浏览器的 localStorage 中——从不发送到任何服务器 |

### 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/ikirieyu/VideMove.git
cd VideMove

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器中打开 **http://localhost:5173**。

### 🔑 配置 AI 提供商

1. 打开应用，点击顶部的 **⚙️ 设置** 图标
2. 进入 **🤖 AI Provider** 标签页
3. 选择您偏好的提供商并输入 API 密钥
4. 点击 **Save Settings**

> **提示：** Pollinations AI 无需 API 密钥即可使用（免费，有限制）。为获得最佳效果，建议使用 OpenAI `gpt-4o-mini`。

### 📐 布局编辑器

1. 点击侧边栏的 **模板** 图标
2. 切换到 **📐 Layout** 标签页
3. 选择纵横比（16:9、9:16、1:1、4:3、21:9）
4. 实时调整字幕和标题样式

### 🛡 安全性

您的 API 密钥**绝不会**发送到 VideMove 服务器。所有 AI 请求都直接从您的浏览器发送到对应的 AI 提供商。您的视频数据永远不会离开您的设备。

---

## 🇯🇵 日本語

### VideMove とは？

**VideMove** は、AIを搭載したブラウザベースのビデオエディターです。完全にブラウザ内で動作します——インストール不要、サーバー不要、どこにもデータをアップロードしません。すべての処理はお使いのデバイス上でローカルに行われます。

### ✨ 主な機能

| 機能 | 説明 |
|---|---|
| 🤖 **マルチ AI プロバイダー** | 11の AIプロバイダーをサポート：OpenAI、Pollinations、Gemini、Groq、AiHubMix、AI/ML API、DeepSeek、Grok、Moonshot、MiniMax、Qwen |
| ✂️ **AI 自動カット** | AI分析を使用してビデオから最高のクリップを自動的に見つける |
| 💬 **字幕自動生成** | Groq WhisperまたはブラウザのSpeech APIを使用して音声を字幕に変換 |
| 🎨 **ビデオテンプレート** | TikTok、Instagram、YouTubeなどに最適化された6種類以上の美しいテンプレート |
| 📐 **レイアウトエディター** | アスペクト比、字幕位置、フォントサイズ、色のリアルタイムGUIコントロール |
| 📤 **FFmpeg エクスポート** | カスタム解像度と品質でビデオをエクスポート——100%ローカルで実行 |
| 🔒 **プライバシー重視** | APIキーはブラウザのlocalStorageにのみ保存——どのサーバーにも送信されない |

### 🚀 はじめ方

```bash
# リポジトリをクローン
git clone https://github.com/ikirieyu/VideMove.git
cd VideMove

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで **http://localhost:5173** を開いてください。

### 🔑 AIプロバイダーの設定

1. アプリを開き、ヘッダーの **⚙️ Settings** アイコンをクリック
2. **🤖 AI Provider** タブに移動
3. 希望のプロバイダーを選択してAPIキーを入力
4. **Save Settings** をクリック

> **ヒント：** Pollinations AIはAPIキーなしで使用できます（無料、制限あり）。最良の結果のためには、OpenAI `gpt-4o-mini`をお勧めします。

### 📐 レイアウトエディター

1. サイドバーの **テンプレート** アイコンをクリック
2. **📐 Layout** タブに切り替え
3. アスペクト比を選択（16:9、9:16、1:1、4:3、21:9）
4. 字幕とタイトルのスタイルをリアルタイムで調整

### 🛡 セキュリティ

APIキーはVideMoveのサーバーに**送信されることはありません**。すべてのAIリクエストはブラウザから直接対応するAIプロバイダーに送信されます。ビデオデータはデバイスから外部に出ることはありません。

---

<div align="center">

## 📜 License

MIT © 2026 [ikirieyu](https://github.com/ikirieyu)

---

*Made with ❤️ · AI-powered · Privacy-first · Open Source*

⭐ **If you find this useful, please give it a star!** ⭐

</div>
