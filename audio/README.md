# 把音频文件放在这个目录

## 怎么用（三种方式，任选一种）

### 方式一：改 manifest.json（推荐）

1. 把音频文件复制到本目录，比如 `ciallo.mp3`、`ciallo2.mp3`
2. 打开 `manifest.json`，把文件名填进 `files` 数组：

```json
{
  "files": ["ciallo.mp3", "ciallo2.mp3"]
}
```

3. 刷新网页，音效就自动加载了。以后加音频只要往数组里多加一行。

### 方式二：什么都不做，靠自动探测

如果你把文件命名为下面这些名字，网页会自动找到：

```
audio/ciallo.mp3     audio/ciallo1.mp3    audio/ciallo2.mp3
audio/sound.mp3      audio/voice.mp3      audio/1.mp3  ~  audio/5.mp3
```

支持的扩展名：`mp3` `wav` `ogg` `m4a` `aac` `flac` `opus` `webm`

### 方式三：网页里手动选

点右下角「设置」→「选择本地音频」，直接挑文件。
这种方式只对当前这次会话有效，刷新后需要重选，适合临时试听。

## 注意事项

- **用鼠标双击打开 `index.html` 时**，浏览器可能因安全策略拦截 manifest 的读取（本地文件协议限制）。此时请用方式二的自动探测，或方式三手动选择。
- **想完全避免限制**，可以在本目录的上级（`网站1` 目录）跑一个本地服务器：

```
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 音频裁掉头尾空白

示例音频做过静音裁剪，命令如下（保留 128kbps 便于各端解码）：

```
ffmpeg -i input.mp3 -af "silenceremove=start_periods=1:start_threshold=-45dB:start_duration=0.05" -b:a 128k out.mp3
```

如果结尾也有空白，追加 `areverse` 再裁一次：

```
ffmpeg -i input.mp3 -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse" -b:a 128k out.mp3
```

## 版权提醒（重要）

**本目录下的音频文件不包含在项目的 AI 训练授权范围内**（详见仓库根目录的 `AI-TRAINING-NOTICE.md`）。

Ciallo 的原始语音出自《魔女的夜宴》（サノバウィッチ，YUZU SOFT），版权归 YUZU SOFT 所有。
本目录内文件仅作演示用途。如果这个页面要公开部署或商用，请替换为自制录音、AI 合成或已获授权的声音素材。
