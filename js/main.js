/* ==========================================================
   main.js - 主逻辑：事件绑定、UI 交互、状态管理
   ========================================================== */
(function () {
  'use strict';

  /* ==========================================================
     常量
     ========================================================== */

  var LS_KEY = 'ciallo-site-v1';

  var SPEED_PRESETS = [
    { label: '慢', value: 13 },
    { label: '中', value: 9 },
    { label: '快', value: 6 },
    { label: '极速', value: 4 }
  ];

  var SIZE_PRESETS = [
    { label: '小', value: 22 },
    { label: '中', value: 30 },
    { label: '大', value: 40 },
    { label: '特大', value: 54 }
  ];

  var AUDIO_PROBE_NAMES = [
    'ciallo', 'ciallo1', 'ciallo2', 'ciallo3', 'ciallo4', 'ciallo5',
    'Ciallo', 'Ciallo1', 'Ciallo2', 'Ciallo3', 'sound', 'audio'
  ];
  var AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'm4a'];

  var COMBO_WINDOW = 900;   // 连击判定窗口（毫秒）
  var COMBO_MIN = 4;        // 达到多少连击开始显示特效

  /* ==========================================================
     DOM
     ========================================================== */

  var $ = function (id) { return document.getElementById(id); };

  var dom = {
    body: document.body,
    stage: $('stage'),
    danmakuLayer: $('danmakuLayer'),
    rippleLayer: $('rippleLayer'),
    clickHint: $('clickHint'),
    hintText: $('hintText'),
    audioTip: $('audioTip'),
    countToday: $('countToday'),
    countScreen: $('countScreen'),

    btnSound: $('btnSound'),
    soundIcon: $('soundIcon'),
    soundLabel: $('soundLabel'),
    btnSpeed: $('btnSpeed'),
    speedLabel: $('speedLabel'),
    btnSize: $('btnSize'),
    sizeLabel: $('sizeLabel'),
    btnClear: $('btnClear'),
    btnPanel: $('btnPanel'),

    panel: $('panel'),
    panelMask: $('panelMask'),
    panelClose: $('panelClose'),
    inputTexts: $('inputTexts'),
    btnResetTexts: $('btnResetTexts'),
    filePicker: $('filePicker'),
    btnRetryAudio: $('btnRetryAudio'),
    btnClearAudio: $('btnClearAudio'),
    audioSlots: $('audioSlots'),
    audioPanelHint: $('audioPanelHint')
  };

  /* ==========================================================
     状态
     ========================================================== */

  var cfg = {
    soundOn: true,
    speedIndex: 1,
    sizeIndex: 1,
    texts: null
  };

  var total = 0;          // 本次会话累计次数
  var combo = 0;
  var lastClickAt = 0;
  var audioReady = false;

  /* ==========================================================
     本地存储
     ========================================================== */

  function loadCfg() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (typeof data.soundOn === 'boolean') cfg.soundOn = data.soundOn;
      if (typeof data.speedIndex === 'number') cfg.speedIndex = data.speedIndex;
      if (typeof data.sizeIndex === 'number') cfg.sizeIndex = data.sizeIndex;
      if (Array.isArray(data.texts) && data.texts.length) cfg.texts = data.texts;
    } catch (e) { /* 忽略 */ }
  }

  function saveCfg() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        soundOn: cfg.soundOn,
        speedIndex: cfg.speedIndex,
        sizeIndex: cfg.sizeIndex,
        texts: CialloDanmaku.getTexts()
      }));
    } catch (e) { /* 忽略 */ }
  }

  /* ==========================================================
     应用配置
     ========================================================== */

  function applySpeed() {
    var p = SPEED_PRESETS[cfg.speedIndex];
    document.documentElement.style.setProperty('--danmaku-speed', p.value + 's');
    dom.speedLabel.textContent = '速度 ' + p.label;
  }

  function applySize() {
    var p = SIZE_PRESETS[cfg.sizeIndex];
    document.documentElement.style.setProperty('--danmaku-size', p.value + 'px');
    dom.sizeLabel.textContent = '字号 ' + p.label;
  }

  function applySoundUI() {
    dom.soundIcon.textContent = cfg.soundOn ? '🔊' : '🔇';
    dom.soundLabel.textContent = cfg.soundOn ? '音效开' : '音效关';
    dom.btnSound.classList.toggle('is-off', !cfg.soundOn);
  }

  /* ==========================================================
     音频状态 UI
     ========================================================== */

  function renderAudioSlots() {
    var st = CialloAudio.getState();
    var html = '';
    var i;

    if (st.sounds.length) {
      for (i = 0; i < st.sounds.length; i++) {
        var s = st.sounds[i];
        html += '<div class="audio-slot is-ready">' +
          '<span class="audio-slot-dot"></span>' +
          '<span class="audio-slot-name" title="' + escapeHtml(s.src) + '">' +
            escapeHtml(s.name) +
          '</span>' +
          '<span class="audio-slot-state">' + sourceLabel(s.source) + '</span>' +
        '</div>';
      }
    } else {
      // 展示探测中的候选槽位
      for (i = 0; i < Math.min(AUDIO_PROBE_NAMES.length, 6); i++) {
        var name = AUDIO_PROBE_NAMES[i];
        html += '<div class="audio-slot">' +
          '<span class="audio-slot-dot"></span>' +
          '<span class="audio-slot-name">audio/' + name + '.mp3</span>' +
          '<span class="audio-slot-state">未找到</span>' +
        '</div>';
      }
    }

    dom.audioSlots.innerHTML = html;
  }

  function sourceLabel(src) {
    if (src === 'manifest') return '清单';
    if (src === 'local') return '本地';
    return '自动';
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function updateAudioTip(count) {
    audioReady = count > 0;

    if (audioReady) {
      dom.audioTip.textContent = '已加载 ' + count + ' 条音效 · 点击即可发声';
      dom.audioTip.className = 'hero-tip is-ok';
      dom.audioPanelHint.textContent = '已就绪：共 ' + count + ' 条音效，点击屏幕会随机播放其中一条。';
      dom.btnSound.classList.remove('is-off');
    } else {
      dom.audioTip.textContent = '未检测到音频 · 把文件放进 audio/ 目录后点击「重新检测」';
      dom.audioTip.className = 'hero-tip is-warn';
      dom.audioPanelHint.textContent =
        '未检测到音频。请把音频文件放到 audio/ 目录（例如 audio/ciallo.mp3），' +
        '或在 audio/ 下创建 manifest.json 列出文件名，然后点击「重新检测」。';
    }
    renderAudioSlots();
  }

  /* ==========================================================
     点击涟漪
     ========================================================== */

  function spawnRipple(x, y) {
    var r1 = document.createElement('div');
    r1.className = 'ripple';
    r1.style.left = x + 'px';
    r1.style.top = y + 'px';

    var r2 = document.createElement('div');
    r2.className = 'ripple r2';
    r2.style.left = x + 'px';
    r2.style.top = y + 'px';

    dom.rippleLayer.appendChild(r1);
    dom.rippleLayer.appendChild(r2);

    setTimeout(function () {
      if (r1.parentNode) r1.parentNode.removeChild(r1);
      if (r2.parentNode) r2.parentNode.removeChild(r2);
    }, 1000);
  }

  /* ==========================================================
     连击特效
     ========================================================== */

  function spawnCombo(x, y, n) {
    var el = document.createElement('div');
    el.className = 'combo-badge';
    el.textContent = n + ' COMBO!';
    el.style.left = x + 'px';
    el.style.top = (y - 46) + 'px';
    dom.danmakuLayer.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1200);
  }

  function spawnScore(x, y, text) {
    var el = document.createElement('div');
    el.className = 'float-score';
    el.textContent = text;
    el.style.left = (x + 42) + 'px';
    el.style.top = (y - 30) + 'px';
    dom.danmakuLayer.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1000);
  }

  /* ==========================================================
     核心：点击处理
     ========================================================== */

  function handleTap(x, y) {
    // 1. 涟漪
    spawnRipple(x, y);

    // 2. 连击计算
    var now = Date.now();
    if (now - lastClickAt < COMBO_WINDOW) {
      combo++;
    } else {
      combo = 1;
    }
    lastClickAt = now;

    // 3. 生成弹幕（连击越高字号越大、速度越快）
    var sizeBase = SIZE_PRESETS[cfg.sizeIndex].value;
    var speedBase = SPEED_PRESETS[cfg.speedIndex].value;

    var bonus = Math.min(combo, 12);
    var size = sizeBase * (1 + bonus * 0.035);
    var speed = speedBase * (1 - bonus * 0.022);

    CialloDanmaku.spawn(x, y, {
      speed: speed,
      size: size
    });

    // 4. 音效：多媒体时每条随机挑选，同时叠一点音量起伏增加层次感
    if (cfg.soundOn && audioReady) {
      var vol = 1;
      if (combo >= COMBO_MIN) {
        // 连击时音量在 0.85 ~ 1.0 之间轻微浮动
        vol = 0.85 + Math.min(combo, 12) / 12 * 0.15;
      }
      CialloAudio.play(vol);
    }

    // 5. 特效
    total++;
    if (combo >= COMBO_MIN && combo % 5 === 0) {
      spawnCombo(x, y, combo);
    }
    if (combo > 1 && combo % 10 === 0) {
      spawnScore(x, y, '+' + combo);
    }

    // 6. 更新计数
    dom.countToday.textContent = total;
    dom.countScreen.textContent = CialloDanmaku.count();

    // 7. 首次点击后隐藏提示
    if (total === 1 && dom.clickHint) {
      dom.clickHint.classList.add('is-hidden');
    }
  }

  /* ==========================================================
     事件绑定
     ========================================================== */

  function isInteractive(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el.nodeType === 3) el = el.parentNode;   // 文本节点归到其父元素
    if (!el || !el.closest) return false;
    return !!el.closest('button, a, input, textarea, label, select, .panel, .toolbar, .panel-mask');
  }

  function bindTap() {
    // 用 pointerdown 获得最即时的手感（鼠标 + 触摸统一处理）
    document.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return; // 只响应左键/触摸
      if (isInteractive(e.target)) return;

      // 首次手势解锁自动播放
      if (!CialloAudio.getState().unlocked) {
        CialloAudio.unlock();
      }

      handleTap(e.clientX, e.clientY);
    }, { passive: true });

    // 兜底：个别移动端浏览器（如部分 iOS Safari / 旧版 WebView）
    // 可能不派发 pointerdown，或 pointer events 被系统手势吞掉。
    // 这里再挂一次 click，并用"本次点击已被 pointerdown 处理过"的标记去重，
    // 避免同一次点击触发两条弹幕。
    var lastPointerAt = 0;

    document.addEventListener('pointerdown', function () {
      lastPointerAt = Date.now();
    }, { passive: true, capture: true });

    document.addEventListener('click', function (e) {
      if (Date.now() - lastPointerAt < 900) return;  // 已由 pointerdown 处理
      if (isInteractive(e.target)) return;
      if (!CialloAudio.getState().unlocked) CialloAudio.unlock();
      handleTap(e.clientX, e.clientY);
    }, { passive: true });

    // 长按禁止选中 / 禁止长按弹菜单
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
  }

  function bindToolbar() {
    // 音效开关
    dom.btnSound.addEventListener('click', function () {
      cfg.soundOn = !cfg.soundOn;
      applySoundUI();
      saveCfg();
      if (cfg.soundOn && audioReady) CialloAudio.play(1);
    });

    // 速度
    dom.btnSpeed.addEventListener('click', function () {
      cfg.speedIndex = (cfg.speedIndex + 1) % SPEED_PRESETS.length;
      applySpeed();
      saveCfg();
    });

    // 字号
    dom.btnSize.addEventListener('click', function () {
      cfg.sizeIndex = (cfg.sizeIndex + 1) % SIZE_PRESETS.length;
      applySize();
      saveCfg();
    });

    // 清屏
    dom.btnClear.addEventListener('click', function () {
      var n = CialloDanmaku.clear();
      dom.countScreen.textContent = '0';
      flashLabel(dom.btnClear, n ? '已清 ' + n : '清屏');
    });

    // 面板
    dom.btnPanel.addEventListener('click', openPanel);
  }

  function flashLabel(btn, text) {
    var label = btn.querySelector('.tb-label');
    if (!label) return;
    var old = label.textContent;
    label.textContent = text;
    setTimeout(function () { label.textContent = old; }, 1100);
  }

  function bindPanel() {
    dom.panelMask.addEventListener('click', closePanel);
    dom.panelClose.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });

    // 文案编辑
    var saveTimer = null;
    dom.inputTexts.addEventListener('input', function () {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        CialloDanmaku.setTexts(dom.inputTexts.value.split('\n'));
        saveCfg();
      }, 350);
    });

    dom.btnResetTexts.addEventListener('click', function () {
      var list = CialloDanmaku.resetTexts();
      dom.inputTexts.value = list.join('\n');
      saveCfg();
      flashLabel(dom.btnResetTexts, '已恢复');
    });

    // 本地文件导入
    dom.filePicker.addEventListener('change', function (e) {
      var files = e.target.files;
      if (!files || !files.length) return;
      CialloAudio.addLocalFiles(files).then(function (count) {
        updateAudioTip(count);
        flashLabel(dom.btnResetTexts, '');
      });
      e.target.value = '';
    });

    // 重新检测
    dom.btnRetryAudio.addEventListener('click', function () {
      dom.audioPanelHint.textContent = '正在重新检测…';
      CialloAudio.init().then(function (count) {
        updateAudioTip(count);
      });
    });

    // 清除本地导入
    dom.btnClearAudio.addEventListener('click', function () {
      var count = CialloAudio.clearLocal();
      updateAudioTip(count);
      flashLabel(dom.btnClearAudio, '已清除');
    });
  }

  function openPanel() {
    // 打开面板时同步当前文案
    dom.inputTexts.value = CialloDanmaku.getTexts().join('\n');
    dom.panel.classList.add('is-open');
    dom.panel.setAttribute('aria-hidden', 'false');
    dom.panelMask.classList.add('is-open');
  }

  function closePanel() {
    dom.panel.classList.remove('is-open');
    dom.panel.setAttribute('aria-hidden', 'true');
    dom.panelMask.classList.remove('is-open');
  }

  /* ==========================================================
     键盘快捷键
     ========================================================== */

  function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;

      var x = window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth * 0.44;
      var y = window.innerHeight / 2 + (Math.random() - 0.5) * window.innerHeight * 0.44;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (!CialloAudio.getState().unlocked) CialloAudio.unlock();
        handleTap(x, y);
      } else if (e.key === 'c' || e.key === 'C') {
        CialloDanmaku.clear();
        dom.countScreen.textContent = '0';
      } else if (e.key === 's' || e.key === 'S') {
        dom.btnSound.click();
      } else if (e.key === 'Escape') {
        closePanel();
      }
    });
  }

  /* ==========================================================
     自动演示（无音频时也让页面不空）
     ========================================================== */

  function startIdleShow() {
    var shown = 0;
    var timer = setInterval(function () {
      if (total > 0 || shown >= 3) {
        clearInterval(timer);
        return;
      }
      shown++;
      var x = rand(0.2, 0.8) * window.innerWidth;
      var y = rand(0.25, 0.7) * window.innerHeight;
      CialloDanmaku.spawn(x, y, { speed: 11 });
      dom.countScreen.textContent = CialloDanmaku.count();
    }, 2400);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  /* ==========================================================
     启动
     ========================================================== */

  function boot() {
    loadCfg();

    CialloDanmaku.init(dom.danmakuLayer);
    if (cfg.texts) {
      CialloDanmaku.setTexts(cfg.texts);
    }

    applySpeed();
    applySize();
    applySoundUI();
    renderAudioSlots();

    bindTap();
    bindToolbar();
    bindPanel();
    bindKeyboard();

    // 音频异步加载，不阻塞页面
    CialloAudio.init().then(function (count) {
      updateAudioTip(count);
    }).catch(function () {
      updateAudioTip(0);
    });

    startIdleShow();

    // 在控制台留个操作入口
    console.log(
      '%cCiallo～(∠・ω< )⌒☆',
      'color:#ff8ec7;font-size:20px;font-weight:900;',
      '\n把音频放进 audio/ 目录即可发声。\n' +
      'manifest 格式：audio/manifest.json → ["ciallo.mp3","ciallo2.mp3"]'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
