const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(item => item.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'quadratic') drawQuadratic();
    else drawTrigonometric();
  });
});

function formatNumber(number) {
  const rounded = Math.round(number * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function drawAxes(ctx, width, height, xMin, xMax, yMin, yMax) {
  const toX = x => (x - xMin) / (xMax - xMin) * width;
  const toY = y => height - (y - yMin) / (yMax - yMin) * height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#edf0f5';
  ctx.lineWidth = 1;
  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    ctx.beginPath(); ctx.moveTo(toX(x), 0); ctx.lineTo(toX(x), height); ctx.stroke();
  }
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    ctx.beginPath(); ctx.moveTo(0, toY(y)); ctx.lineTo(width, toY(y)); ctx.stroke();
  }

  ctx.strokeStyle = '#8b95a7';
  ctx.lineWidth = 1.5;
  if (xMin <= 0 && xMax >= 0) {
    ctx.beginPath(); ctx.moveTo(toX(0), 0); ctx.lineTo(toX(0), height); ctx.stroke();
  }
  if (yMin <= 0 && yMax >= 0) {
    ctx.beginPath(); ctx.moveTo(0, toY(0)); ctx.lineTo(width, toY(0)); ctx.stroke();
  }
  ctx.fillStyle = '#667085';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    if (x !== 0) ctx.fillText(String(x), toX(x), toY(0) + 16);
  }
  ctx.textAlign = 'right';
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    if (y !== 0) ctx.fillText(String(y), toX(0) - 6, toY(y) + 4);
  }
  ctx.fillText('0', toX(0) - 6, toY(0) + 16);

  return { toX, toY };
}

const quadraticInputs = ['a', 'b', 'c'].map(id => document.getElementById(id));

function drawQuadratic() {
  const a = Number(document.getElementById('a').value);
  const b = Number(document.getElementById('b').value);
  const c = Number(document.getElementById('c').value);

  document.getElementById('aValue').textContent = formatNumber(a);
  document.getElementById('bValue').textContent = formatNumber(b);
  document.getElementById('cValue').textContent = formatNumber(c);

  const canvas = document.getElementById('quadraticCanvas');
  const { ctx, width, height } = setupCanvas(canvas);
  const xMin = -8, xMax = 8, yMin = -8, yMax = 8;
  const { toX, toY } = drawAxes(ctx, width, height, xMin, xMax, yMin, yMax);

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  let started = false;
  for (let px = 0; px <= width; px++) {
    const x = xMin + px / width * (xMax - xMin);
    const y = a * x * x + b * x + c;
    const py = toY(y);
    if (py >= -height * 2 && py <= height * 3) {
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    } else started = false;
  }
  ctx.stroke();

  if (Math.abs(a) > 0.0001) {
    const vx = -b / (2 * a);
    const vy = a * vx * vx + b * vx + c;
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath(); ctx.arc(toX(vx), toY(vy), 6, 0, Math.PI * 2); ctx.fill();
  }

  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  const discriminant = b * b - 4 * a * c;
  document.getElementById('quadraticFormula').textContent = `y = ${formatNumber(a)}x² ${b >= 0 ? '+' : '−'} ${formatNumber(Math.abs(b))}x ${c >= 0 ? '+' : '−'} ${formatNumber(Math.abs(c))}`;
  document.getElementById('quadraticVertex').textContent = `頂点 (${formatNumber(vertexX)}, ${formatNumber(vertexY)})`;
  document.getElementById('quadraticAxis').textContent = `軸 x = ${formatNumber(vertexX)}`;
  const roots = discriminant > 0 ? '2個の実数解' : discriminant === 0 ? '重解' : '実数解なし';
  document.getElementById('quadraticDiscriminant').textContent = `判別式 D = ${formatNumber(discriminant)}（${roots}）`;
}

quadraticInputs.forEach(input => input.addEventListener('input', drawQuadratic));
document.getElementById('quadraticReset').addEventListener('click', () => {
  document.getElementById('a').value = 1;
  document.getElementById('b').value = 0;
  document.getElementById('c').value = 0;
  drawQuadratic();
});

const trigInputs = ['amp', 'freq', 'phase', 'shift'].map(id => document.getElementById(id));

function drawTrigonometric() {
  const amp = Number(document.getElementById('amp').value);
  const freq = Number(document.getElementById('freq').value);
  const phase = Number(document.getElementById('phase').value);
  const shift = Number(document.getElementById('shift').value);

  document.getElementById('ampValue').textContent = formatNumber(amp);
  document.getElementById('freqValue').textContent = formatNumber(freq);
  document.getElementById('phaseValue').textContent = formatNumber(phase);
  document.getElementById('shiftValue').textContent = formatNumber(shift);

  const canvas = document.getElementById('trigCanvas');
  const { ctx, width, height } = setupCanvas(canvas);
  const xMin = -2 * Math.PI, xMax = 2 * Math.PI, yMin = -5, yMax = 5;
  const { toX, toY } = drawAxes(ctx, width, height, xMin, xMax, yMin, yMax);

  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let px = 0; px <= width; px++) {
    const x = xMin + px / width * (xMax - xMin);
    const y = amp * Math.sin(freq * x + phase) + shift;
    if (px === 0) ctx.moveTo(px, toY(y));
    else ctx.lineTo(px, toY(y));
  }
  ctx.stroke();

  const sign = phase >= 0 ? '+' : '−';
  document.getElementById('trigFormula').textContent = `y = ${formatNumber(amp)} sin(${formatNumber(freq)}x ${sign} ${formatNumber(Math.abs(phase))}) ${shift >= 0 ? '+' : '−'} ${formatNumber(Math.abs(shift))}`;
  document.getElementById('trigPeriod').textContent = `周期 = ${formatNumber(2 * Math.PI / freq)} = ${formatNumber(2 * Math.PI / freq / Math.PI)}π`;
  document.getElementById('trigPhase').textContent = `位相のずれ = ${formatNumber(-phase / freq)}`;
}

trigInputs.forEach(input => input.addEventListener('input', drawTrigonometric));
document.getElementById('trigReset').addEventListener('click', () => {
  document.getElementById('amp').value = 1;
  document.getElementById('freq').value = 1;
  document.getElementById('phase').value = 0;
  document.getElementById('shift').value = 0;
  drawTrigonometric();
});

window.addEventListener('resize', () => {
  const active = document.querySelector('.panel.active');
  if (active.id === 'quadratic') drawQuadratic();
  else drawTrigonometric();
});

window.addEventListener('load', () => {
  drawQuadratic();
  drawTrigonometric();
});
