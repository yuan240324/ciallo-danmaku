/* ==========================================================
   danmaku.js - 弹幕生成与回收
   ----------------------------------------------------------
   点击屏幕 → 在该点生成一条弹幕，沿随机方向飘出，动画结束后回收。
   使用 requestAnimationFrame 无关的纯 CSS 动画方案，性能更好。
   ========================================================== */
(function (global) {
  'use strict';

  /* ---------- 默认文案 ---------- */
  var DEFAULT_TEXTS = [
    'Ciallo～(∠・ω< )⌒☆',
    'Ciallo！',
    '恰洛～',
    'Ciallo～(∠・ω< )⌒★',
    'Ciallo Ciallo Ciallo！',
    'ciallo ～',
    '∠・ω< )⌒☆',
    'Ciallo～'
  ];

  /* ---------- 样式池 ---------- */
  var STYLES = [
    { cls: '',               weight: 40 },  // 纯白描边（默认）
    { cls: 'style-glow',     weight: 20 },  // 霓虹发光
    { cls: 'style-rainbow',  weight: 14 },  // 彩虹流光
    { cls: 'style-outline',  weight: 12 },  // 青色空心
    { cls: 'style-small',    weight: 14 }   // 小号
  ];

  var COLORS = [
    '#ffffff', '#ff8ec7', '#ffb3dc', '#ffe08a',
    '#6fe3ff', '#a065ff', '#b8ffd9', '#ffc9a3'
  ];

  /* ---------- 内部状态 ---------- */
  var layer = null;
  var texts = DEFAULT_TEXTS.slice();
  var live = [];          // 当前存活节点
  var maxLive = 70;       // 同屏上限，超出则移除最老的
  var reduced = false;    // 用户偏好减弱动效

  /* ---------- 工具 ---------- */

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** 按权重挑选 */
  function pickWeighted(items) {
    var total = 0;
    var i;
    for (i = 0; i < items.length; i++) total += items[i].weight || 1;
    var r = Math.random() * total;
    for (i = 0; i < items.length; i++) {
      r -= items[i].weight || 1;
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /* ---------- 回收 ---------- */

  function recycle(node) {
    var idx = live.indexOf(node);
    if (idx !== -1) live.splice(idx, 1);
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  /* ---------- 对外 API ---------- */

  var Danmaku = {
    /** 初始化 */
    init: function (layerEl) {
      layer = layerEl;
      reduced = global.matchMedia &&
        global.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return Danmaku;
    },

    /** 设置文案列表 */
    setTexts: function (list) {
      var clean = (list || [])
        .map(function (t) { return String(t).trim(); })
        .filter(function (t) { return t.length > 0; })
        .slice(0, 60);
      texts = clean.length ? clean : DEFAULT_TEXTS.slice();
      return texts.length;
    },

    /** 取当前文案列表 */
    getTexts: function () {
      return texts.slice();
    },

    /** 恢复默认文案 */
    resetTexts: function () {
      texts = DEFAULT_TEXTS.slice();
      return texts.slice();
    },

    /**
     * 在指定坐标生成一条弹幕。
     * @param {number} x 视口坐标
     * @param {number} y 视口坐标
     * @param {object} [opts]
     *        opts.text  指定文字
     *        opts.speed 飘过时长（秒）
     *        opts.size  字号（px）
     * @returns {HTMLElement|null}
     */
    spawn: function (x, y, opts) {
      if (!layer) return null;
      opts = opts || {};

      // 超上限时先回收最老的几条
      while (live.length >= maxLive) {
        recycle(live[0]);
      }

      var el = document.createElement('div');
      el.className = 'danmaku';

      var style = reduced ? STYLES[0] : pickWeighted(STYLES);
      if (style.cls) el.classList.add(style.cls.split(' ')[0]);

      // 彩虹样式自己带渐变，不需要额外颜色
      if (style.cls.indexOf('rainbow') === -1) {
        el.style.color = opts.color || pick(COLORS);
      }

      if (reduced) {
        el.classList.add('is-stroke');
      }

      el.textContent = opts.text || pick(texts);

      // --- 计算飘出方向与位移 ---
      var vw = global.innerWidth;
      var vh = global.innerHeight;

      // 优先让弹幕飘向"空间更大"的一侧：从屏幕左半点击向右飘，右半点击向左飘，
      // 避免一生成就贴边飞出。同时保留少量随机性。
      var preferRight = x < vw * 0.5;
      var goRight = Math.random() < 0.72 ? preferRight : !preferRight;
      var dx = goRight ? (vw - x + 260) : -(x + 260);

      // 垂直偏移：让弹幕不至于完全水平堆叠
      var dy = rand(-vh * 0.32, vh * 0.32);
      // 保证不飘出上下边界太多
      var targetY = y + dy;
      if (targetY < 40) dy = 40 - y;
      if (targetY > vh - 40) dy = (vh - 40) - y;

      // --- 时长 ---
      var baseDur = typeof opts.speed === 'number' ? opts.speed : 9;
      // 距离越远飘得越久，保证速度观感一致
      var dist = Math.abs(dx);
      var dur = baseDur * (0.62 + 0.38 * (dist / vw));
      dur += rand(-0.6, 0.6);
      dur = Math.max(4.2, Math.min(dur, 18));

      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.setProperty('--dx', dx.toFixed(1) + 'px');
      el.style.setProperty('--dy', dy.toFixed(1) + 'px');
      el.style.setProperty('--dur', dur.toFixed(2) + 's');

      if (opts.size) {
        el.style.fontSize = opts.size + 'px';
      }

      el.classList.add('is-flying');

      layer.appendChild(el);
      live.push(el);

      // 动画结束回收
      var onEnd = function (e) {
        if (e && e.target !== el) return;
        el.removeEventListener('animationend', onEnd);
        recycle(el);
      };
      el.addEventListener('animationend', onEnd);

      // 兜底回收（防止 animationend 未触发）
      setTimeout(function () {
        if (live.indexOf(el) !== -1) recycle(el);
      }, (dur + 1.2) * 1000);

      return el;
    },

    /** 清空全部弹幕 */
    clear: function () {
      var n = live.length;
      live.slice().forEach(recycle);
      return n;
    },

    /** 当前同屏数量 */
    count: function () {
      return live.length;
    },

    /** 同屏上限 */
    setMaxLive: function (n) {
      maxLive = Math.max(10, Math.min(200, n | 0));
    }
  };

  global.CialloDanmaku = Danmaku;

})(window);
