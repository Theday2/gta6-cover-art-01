// VICE COVER STUDIO — offline sunset cover maker.
// All artwork (sky, sun, palms, skyline) is drawn in code. Photos stay local.
(function () {
  'use strict';

  var canvas = document.getElementById('preview');
  var ctx = canvas.getContext('2d');

  var state = {
    layout: 1,
    activePanel: 0,
    exportSize: '1080x1350',
    caption: 'SUNSET HEIST',
    sub: 'VICE CITY · EST. 2026',
    style: 'sunset',
    capSize: 1,
    capPos: 'bottom',
    photos: [], // { name, img }
    panels: [
      { photo: 0, zoom: 1, ox: 0, oy: 0, grade: true },
      { photo: 1, zoom: 1, ox: 0, oy: 0, grade: true },
      { photo: 0, zoom: 1.25, ox: 0, oy: 0, grade: true },
      { photo: 1, zoom: 1.25, ox: 0, oy: 0, grade: true },
    ],
  };

  var SAMPLES = [
    { name: 'boulevard', src: 'samples/boulevard.jpg' },
    { name: 'pier', src: 'samples/pier.jpg' },
  ];

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  // ---------- sunset background, drawn in code ----------
  function drawSunset(c, w, h) {
    var sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#1c0b3d');
    sky.addColorStop(0.35, '#6d1e6e');
    sky.addColorStop(0.62, '#ff2d78');
    sky.addColorStop(0.82, '#ff8a00');
    sky.addColorStop(1, '#ffd23e');
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);

    // retro sun with stripe cuts
    var cx = w * 0.5, cy = h * 0.58, r = Math.min(w, h) * 0.26;
    var sun = c.createLinearGradient(0, cy - r, 0, cy + r);
    sun.addColorStop(0, '#fff3b0');
    sun.addColorStop(0.5, '#ffb300');
    sun.addColorStop(1, '#ff5e3a');
    c.save();
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
    c.fillStyle = sun; c.fillRect(cx - r, cy - r, r * 2, r * 2);
    c.fillStyle = '#ff2d78';
    var y = cy + r * 0.05;
    var gap = r * 0.045;
    while (y < cy + r) { c.fillRect(cx - r, y, r * 2, gap); y += gap * 2.6; gap *= 1.5; }
    c.restore();
    // sun glow
    var glow = c.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.2);
    glow.addColorStop(0, 'rgba(255,150,60,0.35)');
    glow.addColorStop(1, 'rgba(255,150,60,0)');
    c.fillStyle = glow; c.fillRect(0, 0, w, h);

    drawSkyline(c, w, h);
    drawPalms(c, w, h);

    // vignette
    var vg = c.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(10,2,24,0.55)');
    c.fillStyle = vg; c.fillRect(0, 0, w, h);
    // fine grain
    c.save(); c.globalAlpha = 0.05;
    for (var i = 0; i < 900; i++) {
      c.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      c.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
    c.restore();
  }

  function drawSkyline(c, w, h) {
    var base = h * 0.94;
    c.fillStyle = '#170a2e';
    var x = 0;
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    while (x < w) {
      var bw = w * (0.05 + rnd() * 0.07);
      var bh = h * (0.06 + rnd() * 0.16);
      c.fillRect(x, base - bh, bw, bh + h * 0.06);
      // antenna
      if (rnd() > 0.6) { c.fillRect(x + bw / 2 - 1, base - bh - h * 0.04, 2, h * 0.04); }
      // lit windows
      c.fillStyle = 'rgba(255,210,62,0.85)';
      for (var wy = base - bh + 6; wy < base - 6; wy += 12) {
        for (var wx = x + 5; wx < x + bw - 5; wx += 11) {
          if (rnd() > 0.55) c.fillRect(wx, wy, 4, 6);
        }
      }
      c.fillStyle = '#170a2e';
      x += bw + 2;
    }
    // ground strip
    c.fillStyle = '#12061f'; c.fillRect(0, base, w, h - base);
  }

  function drawPalms(c, w, h) {
    function palm(px, py, s, flip) {
      c.save(); c.translate(px, py); c.scale(flip ? -s : s, s);
      c.strokeStyle = '#12061f'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(8, -50, 26, -86); c.stroke();
      c.lineWidth = 5;
      var angles = [-160, -125, -95, -65, -30];
      for (var i = 0; i < angles.length; i++) {
        var a = angles[i] * Math.PI / 180;
        var ex = 26 + Math.cos(a) * 52, ey = -86 + Math.sin(a) * 30;
        c.beginPath(); c.moveTo(26, -86);
        c.quadraticCurveTo(26 + Math.cos(a) * 26, -86 + Math.sin(a) * 14 - 10, ex, ey);
        c.stroke();
      }
      c.restore();
    }
    var s = Math.min(w, h) / 520;
    palm(w * 0.03, h * 0.97, s * 1.1, false);
    palm(w * 0.97, h * 0.97, s * 0.95, true);
    palm(w * 0.12, h * 0.99, s * 0.7, false);
  }

  // ---------- panels ----------
  function panelRects(w, h, n) {
    var m = Math.round(Math.min(w, h) * 0.035); // outer margin
    var g = Math.round(Math.min(w, h) * 0.02);  // gap
    var x0 = m, y0 = m, x1 = w - m, y1 = h - m;
    if (n === 1) return [{ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }];
    if (n === 2) {
      var hw = (x1 - x0 - g) / 2;
      return [
        { x: x0, y: y0, w: hw, h: y1 - y0 },
        { x: x0 + hw + g, y: y0, w: hw, h: y1 - y0 },
      ];
    }
    if (n === 3) {
      var heroH = (y1 - y0) * 0.58, smallH = (y1 - y0) - heroH - g;
      var sw = (x1 - x0 - g) / 2;
      return [
        { x: x0, y: y0, w: x1 - x0, h: heroH },
        { x: x0, y: y0 + heroH + g, w: sw, h: smallH },
        { x: x0 + sw + g, y: y0 + heroH + g, w: sw, h: smallH },
      ];
    }
    var cw = (x1 - x0 - g) / 2, ch = (y1 - y0 - g) / 2;
    return [
      { x: x0, y: y0, w: cw, h: ch },
      { x: x0 + cw + g, y: y0, w: cw, h: ch },
      { x: x0, y: y0 + ch + g, w: cw, h: ch },
      { x: x0 + cw + g, y: y0 + ch + g, w: cw, h: ch },
    ];
  }

  function drawPhotoCover(c, img, r, p) {
    if (!img) return;
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var scale = Math.max(r.w / iw, r.h / ih) * p.zoom;
    var dw = iw * scale, dh = ih * scale;
    var dx = r.x + (r.w - dw) / 2 + (p.ox / 100) * r.w * 0.5;
    var dy = r.y + (r.h - dh) / 2 + (p.oy / 100) * r.h * 0.5;
    c.save();
    c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip();
    c.drawImage(img, dx, dy, dw, dh);
    if (p.grade) {
      var gr = c.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
      gr.addColorStop(0, 'rgba(255,45,120,0.18)');
      gr.addColorStop(0.6, 'rgba(255,138,0,0.10)');
      gr.addColorStop(1, 'rgba(255,210,62,0.16)');
      c.fillStyle = gr; c.fillRect(r.x, r.y, r.w, r.h);
    }
    c.restore();
  }

  function drawPanelFrame(c, r, w) {
    c.save();
    c.strokeStyle = 'rgba(255,243,224,0.9)';
    c.lineWidth = Math.max(2, w * 0.004);
    c.strokeRect(r.x, r.y, r.w, r.h);
    c.strokeStyle = 'rgba(0,0,0,0.35)';
    c.lineWidth = Math.max(1, w * 0.002);
    c.strokeRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8);
    c.restore();
  }

  // ---------- caption ----------
  function drawCaption(c, w, h) {
    var text = (state.caption || '').trim().toUpperCase();
    if (!text) return;
    var base = w * 0.085 * state.capSize;
    var font = '900 ' + Math.round(base) + 'px "Arial Black", "Archivo Black", system-ui, sans-serif';
    c.save();
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = font;
    // shrink to fit
    var maxW = w * 0.9;
    while (c.measureText(text).width > maxW && base > w * 0.03) {
      base *= 0.94;
      c.font = '900 ' + Math.round(base) + 'px "Arial Black", "Archivo Black", system-ui, sans-serif';
    }
    var y = state.capPos === 'top' ? h * 0.12 : state.capPos === 'center' ? h * 0.5 : h * 0.87;
    var lw = Math.max(3, base * 0.14);
    c.lineJoin = 'round';
    if (state.style === 'sunset') {
      var grad = c.createLinearGradient(0, y - base / 2, 0, y + base / 2);
      grad.addColorStop(0, '#ffe45c'); grad.addColorStop(0.55, '#ff8a00'); grad.addColorStop(1, '#ff2d78');
      c.strokeStyle = '#14061f'; c.lineWidth = lw;
      c.strokeText(text, w / 2, y);
      c.fillStyle = grad; c.fillText(text, w / 2, y);
    } else if (state.style === 'neon') {
      c.shadowColor = '#ff2d78'; c.shadowBlur = base * 0.35;
      c.strokeStyle = '#ff2d78'; c.lineWidth = lw * 0.7;
      c.strokeText(text, w / 2, y);
      c.fillStyle = '#ffffff'; c.fillText(text, w / 2, y);
      c.shadowColor = '#19e3ff'; c.shadowBlur = base * 0.18;
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillText(text, w / 2, y);
      c.shadowBlur = 0;
    } else { // noir
      c.fillStyle = '#000'; c.fillText(text, w / 2 + base * 0.07, y + base * 0.07);
      c.fillStyle = '#ffffff'; c.fillText(text, w / 2, y);
    }
    // sub-caption
    var sub = (state.sub || '').trim().toUpperCase();
    if (sub) {
      var sy = y + base * 0.75;
      if (state.capPos === 'bottom') sy = Math.min(sy, h * 0.965);
      if (state.capPos === 'top') sy = y + base * 0.72;
      var sSize = Math.max(12, base * 0.24);
      c.font = '700 ' + Math.round(sSize) + 'px system-ui, sans-serif';
      c.fillStyle = 'rgba(255,243,224,0.95)';
      c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = Math.max(2, sSize * 0.18);
      try { c.letterSpacing = Math.round(sSize * 0.3) + 'px'; } catch (e) {}
      c.strokeText(sub, w / 2, sy);
      c.fillText(sub, w / 2, sy);
      try { c.letterSpacing = '0px'; } catch (e) {}
    }
    c.restore();
  }

  // ---------- render ----------
  function renderTo(c, w, h) {
    c.clearRect(0, 0, w, h);
    drawSunset(c, w, h);
    var rects = panelRects(w, h, state.layout);
    for (var i = 0; i < rects.length; i++) {
      var p = state.panels[i];
      var img = state.photos[p.photo] ? state.photos[p.photo].img : null;
      if (img) drawPhotoCover(c, img, rects[i], p);
      else {
        c.save();
        c.fillStyle = 'rgba(20,6,31,0.55)';
        c.fillRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
        c.fillStyle = 'rgba(255,243,224,0.8)';
        c.font = '700 ' + Math.round(w * 0.02) + 'px system-ui, sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('ADD A PHOTO', rects[i].x + rects[i].w / 2, rects[i].y + rects[i].h / 2);
        c.restore();
      }
      drawPanelFrame(c, rects[i], w);
    }
    drawCaption(c, w, h);
  }

  function render() {
    var parts = state.exportSize.split('x');
    canvas.width = +parts[0];
    canvas.height = +parts[1];
    renderTo(ctx, canvas.width, canvas.height);
  }

  // ---------- export ----------
  function exportPNG() {
    var parts = state.exportSize.split('x');
    var w = +parts[0], h = +parts[1];
    var off = document.createElement('canvas');
    off.width = w; off.height = h;
    renderTo(off.getContext('2d'), w, h);
    return new Promise(function (resolve) {
      off.toBlob(function (blob) { resolve(blob); }, 'image/png');
    });
  }

  function downloadExport() {
    exportPNG().then(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cover.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });
  }

  // exposed for automated screenshots (returns data URL of the real export)
  window.VICE = {
    exportDataURL: function () {
      var parts = state.exportSize.split('x');
      var w = +parts[0], h = +parts[1];
      var off = document.createElement('canvas');
      off.width = w; off.height = h;
      renderTo(off.getContext('2d'), w, h);
      return off.toDataURL('image/png');
    },
    setSize: function (s) { state.exportSize = s; render(); },
    state: state,
  };

  // ---------- UI wiring ----------
  function refreshPhotoUI() {
    var list = $('photoList');
    list.innerHTML = '';
    state.photos.forEach(function (ph, i) {
      var t = document.createElement('img');
      t.className = 'photo-thumb' + (state.panels[state.activePanel].photo === i ? ' active' : '');
      t.src = ph.img.src;
      t.alt = ph.name;
      t.title = ph.name + ' — click to use in active panel';
      t.addEventListener('click', function () {
        state.panels[state.activePanel].photo = i;
        refreshPanelUI();
        render();
      });
      list.appendChild(t);
    });
    var sel = $('panelPhotoSelect');
    sel.innerHTML = '';
    state.photos.forEach(function (ph, i) {
      var o = document.createElement('option');
      o.value = i; o.textContent = ph.name;
      sel.appendChild(o);
    });
    sel.value = String(state.panels[state.activePanel].photo);
  }

  function refreshPanelUI() {
    var sel = $('panelSelect');
    sel.innerHTML = '';
    for (var i = 0; i < state.layout; i++) {
      var o = document.createElement('option');
      o.value = i; o.textContent = 'Panel ' + (i + 1);
      sel.appendChild(o);
    }
    sel.value = String(state.activePanel);
    var p = state.panels[state.activePanel];
    $('zoomRange').value = p.zoom;
    $('oxRange').value = p.ox;
    $('oyRange').value = p.oy;
    $('gradeToggle').checked = p.grade;
    $('zoomVal').textContent = p.zoom.toFixed(2) + '×';
    $('oxVal').textContent = p.ox;
    $('oyVal').textContent = p.oy;
    refreshPhotoUI();
  }

  function bindSeg(id, fn) {
    var el = $(id);
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      el.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      fn(b);
    });
  }

  bindSeg('layoutSeg', function (b) {
    state.layout = +b.dataset.layout;
    state.activePanel = 0;
    refreshPanelUI();
    render();
  });
  bindSeg('posSeg', function (b) { state.capPos = b.dataset.pos; render(); });
  bindSeg('sizeSeg', function (b) { state.exportSize = b.dataset.size; render(); });

  $('panelSelect').addEventListener('change', function () {
    state.activePanel = +this.value;
    refreshPanelUI();
  });
  $('panelPhotoSelect').addEventListener('change', function () {
    state.panels[state.activePanel].photo = +this.value;
    refreshPhotoUI();
    render();
  });
  $('zoomRange').addEventListener('input', function () {
    state.panels[state.activePanel].zoom = +this.value;
    $('zoomVal').textContent = (+this.value).toFixed(2) + '×';
    render();
  });
  $('oxRange').addEventListener('input', function () {
    state.panels[state.activePanel].ox = +this.value;
    $('oxVal').textContent = this.value;
    render();
  });
  $('oyRange').addEventListener('input', function () {
    state.panels[state.activePanel].oy = +this.value;
    $('oyVal').textContent = this.value;
    render();
  });
  $('gradeToggle').addEventListener('change', function () {
    state.panels[state.activePanel].grade = this.checked;
    render();
  });
  $('captionInput').addEventListener('input', function () { state.caption = this.value; render(); });
  $('subInput').addEventListener('input', function () { state.sub = this.value; render(); });
  $('styleSelect').addEventListener('change', function () { state.style = this.value; render(); });
  $('capSizeRange').addEventListener('input', function () {
    state.capSize = +this.value;
    $('capSizeVal').textContent = this.value < 0.8 ? 'Small' : this.value > 1.2 ? 'Huge' : 'Big';
    render();
  });
  $('exportBtn').addEventListener('click', downloadExport);

  $('fileInput').addEventListener('change', function () {
    var files = Array.prototype.slice.call(this.files || []);
    files.forEach(function (f) {
      var rd = new FileReader();
      rd.onload = function () {
        loadImage(rd.result).then(function (img) {
          state.photos.push({ name: f.name.replace(/\.[^.]+$/, ''), img: img });
          refreshPhotoUI();
          render();
        });
      };
      rd.readAsDataURL(f);
    });
    this.value = '';
  });

  $('useSamplesBtn').addEventListener('click', function () { loadSamples().then(render); });
  $('clearPhotosBtn').addEventListener('click', function () {
    state.photos = [];
    state.panels.forEach(function (p) { p.photo = 0; });
    refreshPanelUI();
    render();
  });

  function loadSamples() {
    return Promise.all(SAMPLES.map(function (s) {
      return loadImage(s.src).then(function (img) { return { name: s.name, img: img }; });
    })).then(function (loaded) {
      state.photos = loaded;
      refreshPhotoUI();
    });
  }

  // ---------- boot: query params for scripted shots ----------
  function boot() {
    var q = new URLSearchParams(location.search);
    if (q.get('caption')) { state.caption = q.get('caption'); $('captionInput').value = state.caption; }
    if (q.get('sub')) { state.sub = q.get('sub'); $('subInput').value = state.sub; }
    if (q.get('style')) { state.style = q.get('style'); $('styleSelect').value = state.style; }
    if (q.get('layout')) {
      state.layout = clamp(+q.get('layout') || 1, 1, 4);
      document.querySelectorAll('#layoutSeg button').forEach(function (b) {
        b.classList.toggle('active', +b.dataset.layout === state.layout);
      });
    }
    if (q.get('size')) { state.exportSize = q.get('size'); }
    if (q.get('shot') === 'cover') document.body.classList.add('cover-mode');
    loadSamples().then(function () {
      var photo = q.get('photo');
      if (photo) {
        var idx = state.photos.findIndex(function (p) { return p.name === photo; });
        if (idx >= 0) state.panels.forEach(function (p) { p.photo = idx; });
      }
      refreshPanelUI();
      render();
    });
    refreshPanelUI();
    render();
  }

  boot();
})();
