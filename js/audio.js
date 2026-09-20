/* ==========================================================
   audio.js - 音频加载与播放模块
   ----------------------------------------------------------
   加载策略（按优先级自动回退）：
   1) 读取 audio/manifest.json 清单文件（推荐，最稳）
   2) 自动探测 audio/ 目录下常见文件名
   3) 用户在设置面板手动选择本地文件（运行时注入，不落盘）
   ========================================================== */
(function (global) {
  'use strict';

  /* ---------- 配置 ---------- */

  // 支持的扩展名
  var EXTS = ['mp3', 'wav', 'ogg', 'm4a'];

  // 音频资源目录。用相对路径而非以 / 开头，
  // 这样在 GitHub Pages 的子路径（owner.github.io/repo/）下也能正确解析。
  var AUDIO_DIR = 'audio/';

  // manifest 文件路径
  var MANIFEST_PATH = AUDIO_DIR + 'manifest.json';

  // 自动探测的基础名（不带扩展名）。命中任意一个即算成功。
  var PROBE_NAMES = [
    'ciallo', 'ciallo1', 'ciallo2', 'ciallo3',
    'Ciallo', 'sound', 'voice', 'audio',
    '1', '2', '3', '4'
  ];

  // 最多加载多少个音频
  var MAX_SOUNDS = 12;

  /* ---------- 状态 ---------- */

  var state = {
    sounds: [],        // { src, name, source, el }
    pool: [],          // 复用的 Audio 元素
    poolIndex: 0,
    unlocked: false,
    ready: false
  };

  /* ---------- 工具 ---------- */

  function log() {
    if (global.CIALLO_DEBUG) {
      console.log.apply(console, ['[audio]'].concat([].slice.call(arguments)));
    }
  }

  /**
   * 探测某个 URL 是否为可用音频。
   * 用 <audio> 的 canplay 事件判断，比 fetch HEAD 更可靠（本地 file:// 也能用）。
   * @param {string} url
   * @param {number} timeout 毫秒
   * @returns {Promise<boolean>}
   */
  function probeUrl(url, timeout) {
    return new Promise(function (resolve) {
      var el = new Audio();
      var done = false;
      var timer = null;

      function finish(ok) {
        if (done) return;
        done = true;
        if (timer) clearTimeout(timer);
        el.removeEventListener('canplaythrough', onOk);
        el.removeEventListener('loadeddata', onOk);
        el.removeEventListener('error', onErr);
        if (!ok) {
          try { el.src = ''; } catch (e) { /* noop */ }
        }
        resolve(ok);
      }

      function onOk() { finish(true); }
      function onErr() { finish(false); }

      el.addEventListener('canplaythrough', onOk);
      el.addEventListener('loadeddata', onOk);
      el.addEventListener('error', onErr);

      timer = setTimeout(function () { finish(false); }, timeout || 4000);

      el.preload = 'auto';
      el.src = url;
      try { el.load(); } catch (e) { finish(false); }
    });
  }

  /**
   * 尝试从 manifest.json 读取清单。
   * 支持两种格式：
   *   ["ciallo.mp3", "ciallo2.mp3"]
   *   { "files": ["ciallo.mp3"] }
   *   { "sounds": [{ "file": "ciallo.mp3", "name": "Ciallo" }] }
   */
  function loadManifest() {
    return fetch(MANIFEST_PATH, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('manifest not found');
        return res.json();
      })
      .then(function (data) {
        var list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.files)) {
          list = data.files;
        } else if (data && Array.isArray(data.sounds)) {
          list = data.sounds.map(function (s) {
            return typeof s === 'string' ? s : s.file;
          });
        }
        return list
          .filter(function (f) { return typeof f === 'string' && f; })
          .map(function (f) {
            return {
              src: AUDIO_DIR + f.replace(/^\.?\/*/, ''),
              name: f.split('/').pop(),
              source: 'manifest'
            };
          })
          .slice(0, MAX_SOUNDS);
      })
      .catch(function () {
        log('manifest 不可用，进入自动探测');
        return null;
      });
  }

  /**
   * 自动探测：按"基础名"分组尝试，命中即收录。
   * 组内并发、组间串行，避免一次性发出大量无效请求。
   */
  function autoProbe() {
    var found = [];

    // 按"基础名"分组探测：先试 ciallo 的所有扩展名，命中后再试 ciallo1，
    // 一旦某个基础名整个没命中，就继续下一个，避免无意义的全量笛卡尔积。
    var groups = PROBE_NAMES.map(function (n) {
      return EXTS.map(function (e) {
        return { src: AUDIO_DIR + n + '.' + e, name: n + '.' + e, source: 'probe' };
      });
    });

    function probeGroup(i) {
      if (i >= groups.length || found.length >= MAX_SOUNDS) {
        return Promise.resolve();
      }
      var group = groups[i];

      // 组内并发探测（同基础名的不同扩展名，最多 8 个请求）
      return Promise.all(group.map(function (item) {
        return probeUrl(item.src, 3000).then(function (ok) {
          return ok ? item : null;
        });
      })).then(function (results) {
        var hits = results.filter(Boolean);
        if (hits.length) {
          hits.slice(0, 1).forEach(function (h) { found.push(h); });
        }
        return probeGroup(i + 1);
      });
    }

    return probeGroup(0).then(function () {
      log('自动探测完成，找到', found.length, '条');
      return found;
    });
  }

  /**
   * 为一个音频源创建可复用的 Audio 元素池。
   */
  function buildPool(sounds) {
    state.sounds = sounds.map(function (s) {
      var el = new Audio(s.src);
      el.preload = 'auto';
      return {
        src: s.src,
        name: s.name,
        source: s.source,
        el: el
      };
    });

    // 播放池：每个源复制若干份，随机取用，支持快速连点叠加播放
    state.pool = [];
    state.sounds.forEach(function (s) {
      var copies = 3;
      for (var i = 0; i < copies; i++) {
        var a = new Audio(s.src);
        a.preload = 'auto';
        a.volume = 1;
        state.pool.push(a);
      }
    });
    state.poolIndex = 0;
    log('音频池构建完成，共', state.pool.length, '个播放器');
  }

  /**
   * 释放当前所有本地导入音频的 objectURL。
   * 仅在重新构建音频池前调用，避免重复占用内存。
   */
  function releaseLocalUrls() {
    state.sounds.forEach(function (s) {
      if (s.source === 'local' && s.src) {
        try { URL.revokeObjectURL(s.src); } catch (e) { /* noop */ }
      }
    });
  }

  /* ---------- 对外 API ---------- */

  var Audio2 = {
    /** 原始状态只读访问 */
    getState: function () {
      return {
        ready: state.ready,
        unlocked: state.unlocked,
        count: state.sounds.length,
        sounds: state.sounds.map(function (s) {
          return { name: s.name, src: s.src, source: s.source };
        })
      };
    },

    /**
     * 初始化：依次尝试 manifest → 自动探测。
     * @returns {Promise<number>} 成功加载的音频数量
     */
    init: function () {
      return loadManifest().then(function (fromManifest) {
        if (fromManifest && fromManifest.length) {
          // manifest 里声明的文件仍要验证一下可用性
          return Promise.all(fromManifest.map(function (m) {
            return probeUrl(m.src, 4000).then(function (ok) {
              return ok ? m : null;
            });
          })).then(function (arr) {
            var valid = arr.filter(Boolean);
            if (valid.length) return valid;
            return autoProbe();
          });
        }
        return autoProbe();
      }).then(function (sounds) {
        if (!sounds || !sounds.length) {
          state.ready = false;
          state.sounds = [];
          state.pool = [];
          return 0;
        }
        // 重新初始化时，先释放上一次的本地 objectURL，避免内存泄漏
        releaseLocalUrls();
        buildPool(sounds);
        state.ready = true;
        return sounds.length;
      });
    },

    /**
     * 用户手动选择本地文件（运行时注入）。
     * @param {FileList|File[]} files
     * @returns {Promise<number>} 累计数量
     */
    addLocalFiles: function (files) {
      var arr = [].slice.call(files || []).filter(function (f) {
        if (!f) return false;
        if (f.type && f.type.indexOf('audio/') === 0) return true;
        return /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i.test(f.name || '');
      });
      if (!arr.length) return Promise.resolve(state.sounds.length);

      var added = arr.map(function (f) {
        var url = URL.createObjectURL(f);
        return {
          src: url,
          name: f.name,
          source: 'local',
          objectUrl: url
        };
      });

      // 追加到现有列表
      var merged = state.sounds.concat(added).slice(0, MAX_SOUNDS);
      buildPool(merged);
      state.ready = true;
      return Promise.resolve(state.sounds.length);
    },

    /** 清除所有本地导入的音频 */
    clearLocal: function () {
      var kept = state.sounds.filter(function (s) {
        if (s.source === 'local') {
          try { URL.revokeObjectURL(s.src); } catch (e) { /* noop */ }
          return false;
        }
        return true;
      });
      state.sounds = kept.length ? kept : [];
      if (kept.length) {
        buildPool(kept);
        state.ready = true;
      } else {
        state.pool = [];
        state.ready = false;
      }
      return state.sounds.length;
    },

    /**
     * 解锁浏览器自动播放限制。必须在首次用户手势内调用。
     */
    unlock: function () {
      if (state.unlocked) return;
      state.unlocked = true;
      // 用静音播放一次，完成解锁
      state.pool.forEach(function (a) {
        var old = a.volume;
        a.volume = 0;
        var p = a.play();
        if (p && p.then) {
          p.then(function () {
            a.pause();
            a.currentTime = 0;
            a.volume = old;
          }).catch(function () {
            a.volume = old;
          });
        } else {
          try { a.pause(); } catch (e) { /* noop */ }
          a.volume = old;
        }
      });
      log('已尝试解锁自动播放');
    },

    /**
     * 播放一条音效（随机选取）。
     * @param {number} volume 0~1
     * @returns {boolean} 是否成功发起播放
     */
    play: function (volume) {
      if (!state.pool.length) return false;

      // 轮询取用，避免总是打断同一个播放器
      var a = state.pool[state.poolIndex % state.pool.length];
      state.poolIndex++;

      // 如果这个正在播且没播完，换下一个空闲的
      var tries = 0;
      while (!a.paused && !a.ended && tries < state.pool.length) {
        a = state.pool[state.poolIndex % state.pool.length];
        state.poolIndex++;
        tries++;
      }

      try {
        a.currentTime = 0;
      } catch (e) { /* 某些格式未加载完会抛错，忽略 */ }

      a.volume = typeof volume === 'number' ? volume : 1;

      var p = a.play();
      if (p && p.catch) {
        p.catch(function (err) {
          log('播放失败:', err && err.name);
        });
      }
      return true;
    },

    /** 是否已加载到可用音频 */
    isReady: function () {
      return state.ready && state.pool.length > 0;
    }
  };

  global.CialloAudio = Audio2;

})(window);
