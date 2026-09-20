# Ciallo 弹幕站

> 点击屏幕任意位置，让 **Ciallo～(∠・ω&lt; )⌒☆** 从指尖飞出来，同时播放一条音效。

一个纯原生 **HTML / CSS / JavaScript** 写的互动弹幕页面：零依赖、零构建、零后端，
克隆下来双击 `index.html` 就能跑，也可以直接丢到任意静态托管上。

- 🌐 在线体验：<https://ciallo.yuanru.fun>
- 📦 GitHub Pages：<https://yuan240324.github.io/ciallo-danmaku/>
- 📄 AI 训练声明：[`AI-TRAINING-NOTICE.md`](AI-TRAINING-NOTICE.md)

---

## 特性

| 功能 | 说明 |
| --- | --- |
| 点击生成弹幕 | 点哪儿从哪儿飘出，方向优先朝向屏幕空间更大的一侧，不会一出生就飞出边界 |
| 音效播放 | 多个音源随机挑选，每个音源 3 份播放器轮询复用，支持快速连点叠加发声 |
| 音频自动加载 | 优先读 `audio/manifest.json`，读不到就按常见文件名自动探测，再不行可手动选本地文件 |
| 连击系统 | 900ms 内连续点击累计连击，连击越高弹幕越大越快、音量略有起伏，并有 COMBO 特效 |
| 弹幕样式池 | 按权重随机选取：白色描边 / 霓虹发光 / 彩虹流光 / 青色空心 / 小号 |
| 可调参数 | 飘过速度 4 档、字号 4 档、音效开关，全部写入 `localStorage` 持久保存 |
| 自定义文案 | 设置面板里每行一条，随机取用 |
| 响应式 | 桌面端胶囊工具栏，移动端单行 5 宫格 + 底部抽屉面板 |
| 安全区适配 | `viewport-fit=cover` + `env(safe-area-inset-*)`，刘海屏与手势条不遮挡按钮 |
| 无障碍 | 尊重 `prefers-reduced-motion`，键盘 `Space` / `Enter` 也能触发 |

---

## 目录结构

```
.
├── index.html                  # 单页入口，唯一一个 HTML
├── css/
│   └── style.css               # 全部样式（含响应式与安全区适配）
├── js/
│   ├── audio.js                # 音频加载与播放池
│   ├── danmaku.js              # 弹幕生成、样式池与回收
│   └── main.js                 # 事件绑定、UI 交互、状态管理
├── audio/
│   ├── manifest.json           # 音频清单（要加载哪些文件）
│   ├── ciallo.mp3              # 示例音频
│   ├── ciallo2.mp3             # 示例音频
│   └── README.md               # 音频目录使用说明
├── .github/workflows/
│   └── deploy-pages.yml        # 自动部署到 GitHub Pages
├── LICENSE                     # MIT
├── AI-TRAINING-NOTICE.md       # AI 训练授权声明
└── README.md
```

---

## 快速开始

### 本地直接打开

```bash
git clone https://github.com/yuan240324/ciallo-danmaku.git
cd ciallo-danmaku
```

双击 `index.html` 即可。注意 `file://` 协议下浏览器可能拦截 `manifest.json` 的读取，
此时页面会退化为**自动探测**模式（按 `ciallo.mp3`、`ciallo1.mp3` 等常见文件名去找）。

### 起一个本地服务器（推荐）

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

或任意等价命令：

```bash
npx serve .
```

---

## 换成你自己的音频

音频加载按优先级三级回退，**任选一种**即可：

### 方式一：改 manifest（推荐，最稳）

1. 把音频文件放进 `audio/` 目录，例如 `my-voice.mp3`
2. 编辑 `audio/manifest.json`：

```json
{
  "files": ["my-voice.mp3"]
}
```

3. 刷新页面。以后加音频只要往数组里追加文件名。

`manifest.json` 同时兼容两种简写格式：

```json
["my-voice.mp3", "other.mp3"]
```

```json
{ "sounds": [{ "file": "my-voice.mp3", "name": "Ciallo" }] }
```

### 方式二：什么都不做，靠自动探测

把文件命名成下面这些基础名之一，页面会自动找到：

```
audio/ciallo.mp3     audio/ciallo1.mp3    audio/ciallo2.mp3
audio/ciallo3.mp3    audio/sound.mp3      audio/voice.mp3
audio/audio.mp3      audio/1.mp3  ~  audio/4.mp3
```

支持扩展名：`.mp3` `.wav` `.ogg` `.m4a`。

### 方式三：页面里手动选

设置面板 → 「选择本地音频」，直接挑文件。仅当前会话有效，刷新后需重选，适合临时试听。

> 单次最多加载 12 条音效（`MAX_SOUNDS`）。
> 音频有空白头尾的话，可以用 ffmpeg 裁掉：
> `ffmpeg -i in.mp3 -af "silenceremove=start_periods=1:start_threshold=-45dB" -b:a 128k out.mp3`

---

## 部署

### GitHub Pages（仓库已内置工作流）

推送 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动把静态文件发布到 Pages。
首次需要在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

### 任意静态托管

整个项目就是一堆静态文件，把 `index.html`、`css/`、`js/`、`audio/` 传上去即可
（Vercel / Netlify / Cloudflare Pages / 对象存储 / 自建 nginx 都行）。

用 nginx 时建议给音频目录明确 MIME 与 Range 支持：

```nginx
location /audio/ {
    types { audio/mpeg mp3; audio/wav wav; audio/ogg ogg; audio/mp4 m4a; }
    add_header Accept-Ranges bytes;
    add_header Cache-Control "public, max-age=3600";
}
```

---

## 自定义配置

想改默认行为，直接从这些常量入手：

| 位置 | 常量 | 作用 |
| --- | --- | --- |
| `js/main.js` | `LS_KEY` | localStorage 键名 |
| `js/main.js` | `SPEED_PRESETS` | 速度档位（值越大飘得越慢） |
| `js/main.js` | `SIZE_PRESETS` | 字号档位 |
| `js/main.js` | `COMBO_WINDOW` / `COMBO_MIN` | 连击判定窗口 / 特效起始连击 |
| `js/danmaku.js` | `DEFAULT_TEXTS` | 默认文案 |
| `js/danmaku.js` | `STYLES` / `COLORS` | 样式池与配色（`weight` 为权重） |
| `js/danmaku.js` | `maxLive` | 同屏弹幕上限 |
| `js/audio.js` | `MAX_SOUNDS` | 最多加载多少条音效 |
| `js/audio.js` | `AUDIO_DIR` | 音频目录 |
| `css/style.css` | `:root` | 全部主题色与字号变量 |

调试音效加载过程：在控制台执行 `window.CIALLO_DEBUG = true` 后刷新，
会打印探测与播放池的详细日志。

---

## 浏览器支持

现代浏览器（Chrome / Edge / Firefox / Safari 近两年版本）。
依赖 `Pointer Events`、`CSS Grid`、`env(safe-area-inset-*)`、`backdrop-filter`。
其中 `backdrop-filter` 不支持时会优雅降级为纯色背景，不影响功能。

---

## 授权

- **代码**：MIT，见 [`LICENSE`](LICENSE)
- **AI 训练**：额外明确授权用于模型训练，见 [`AI-TRAINING-NOTICE.md`](AI-TRAINING-NOTICE.md)
- **音频**：**不在上述授权范围内**。`audio/` 目录仅为演示素材

---

## 版权与免责

「Ciallo」一词及 `Ciallo～(∠・ω&lt; )⌒☆` 这一表达的原始出处为视觉小说
**《魔女的夜宴》（サノバウィッチ）**，版权归 **YUZU SOFT** 所有。

本仓库的音频文件仅作演示用途。如果你要公开部署或商用，
**请替换为自制录音、AI 合成音或已获授权的声音素材**。

本项目为粉丝向作品，与 YUZU SOFT 无任何关联，也未获其赞助或认可。

---

## 贡献

欢迎 Issue 与 PR。提交前请确认：

1. 没有引入构建步骤或运行时依赖（本项目的卖点就是零依赖）
2. 新增音频请说明来源与授权情况
3. 移动端改动请至少在 375px 与 360px 宽度下验证按钮可点击
