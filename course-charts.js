const NS = 'http://www.w3.org/2000/svg';
function el(n, a = {}, p) {
  const node = document.createElementNS(NS, n);
  Object.entries(a).forEach(([k, v]) => {
    if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  if (p) p.appendChild(node);
  return node;
}
function label(svg, text, x, y, fill = '#182126', size = 16) {
  el('text', { x, y, fill, 'font-size': size, text }, svg);
}
function grid(svg, w = 760, h = 480, p = 54) {
  svg.innerHTML = '';
  el('rect', { width: w, height: h, fill: '#fff' }, svg);
  for (let y = p; y <= h - p; y += 70) el('line', { class: 'gridline', x1: p, y1: y, x2: w - p, y2: y }, svg);
  for (let x = p; x <= w - p; x += 90) el('line', { class: 'gridline', x1: x, y1: p, x2: x, y2: h - p }, svg);
  el('line', { class: 'axis', x1: p, y1: h - p, x2: w - p, y2: h - p }, svg);
}
function scaleFactory(min, max, top, bottom) {
  return v => bottom - ((v - min) / (max - min)) * (bottom - top);
}
function candle(svg, x, o, h, l, c, s, cls) {
  const yO = s(o), yH = s(h), yL = s(l), yC = s(c);
  const top = Math.min(yO, yC), height = Math.max(5, Math.abs(yC - yO));
  el('line', { class: 'wick', x1: x, y1: yH, x2: x, y2: yL }, svg);
  el('rect', { class: cls || (c >= o ? 'bull' : 'bear'), x: x - 9, y: top, width: 18, height, rx: 3 }, svg);
}
function drawCandles(id, data, opt = {}) {
  const svg = document.getElementById(id), w = opt.w || 760, h = opt.h || 480, p = opt.pad || 54;
  grid(svg, w, h, p);
  const min = Math.min(...data.map(d => d.l)) - 2, max = Math.max(...data.map(d => d.h)) + 2;
  const s = scaleFactory(min, max, p, h - p), step = (w - p * 2) / (data.length - 1);
  data.forEach((d, i) => candle(svg, p + i * step, d.o, d.h, d.l, d.c, s));
  return { svg, scale: s, x: i => p + i * step, w, h, p };
}
function initDeck() {
  const slides = [...document.querySelectorAll('.slide')];
  const progress = document.querySelector('#progress');
  const dots = document.querySelector('#dots');
  let current = 0;
  slides.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = `dot${i === 0 ? ' active' : ''}`;
    d.addEventListener('click', () => show(i));
    dots.appendChild(d);
  });
  const dotEls = [...document.querySelectorAll('.dot')];
  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('active', n === current));
    dotEls.forEach((d, n) => d.classList.toggle('active', n === current));
    progress.textContent = `Slide ${current + 1} / ${slides.length}`;
  }
  document.querySelector('#prev').addEventListener('click', () => show(current - 1));
  document.querySelector('#next').addEventListener('click', () => show(current + 1));
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
  show(0);
}
