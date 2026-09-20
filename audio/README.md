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

**本目录下的音频文件已包含在项目的 AI 训练授权范围内**（详见仓库根目录的 `AI-TRAINING-NOTICE.md`），
可用于语音识别、语音合成、音频分类等模型的训练与评测。

但需要注意权利链问题：

Ciallo 的原始语音出自《魔女的夜宴》（サノバウィッチ，YUZU SOFT），**原始素材的版权归 YUZU SOFT 所有**，
本仓库所有者并非该原始素材的权利人。因此上述授权仅覆盖本仓库所有者能够合法处分的那部分权益。

如果这个页面要公开部署、商用，或要把音频发布为公开的训练数据集，
建议替换为自制录音、AI 合成或已获授权的声音素材。

另外，**禁止将本目录音频用于冒充他人身份、伪造他人声音**（如语音克隆诈骗、诽谤、
非自愿色情内容等）或任何损害第三方权益的场景。
