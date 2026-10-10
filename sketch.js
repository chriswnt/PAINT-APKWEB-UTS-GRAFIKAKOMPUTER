/* Mini Paint: DOM untuk panel, p5.js untuk seluruh rendering dan transformasi. */
'use strict';
const $ = id => document.getElementById(id);
const { makeShape, centerBrush, cloneScene } = PaintGeometry;
const WIDTH = 1200, HEIGHT = 800;
const definitions = [
  ['select', 'Pilih', 'M5 3l14 10-7 1-3 7z'],
  ['brush', 'Kuas', 'M4 19c0-6 5 2 7-4S14 3 20 5'],
  ['point', 'Titik', 'M12 11h.01 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8'],
  ['line', 'Garis', 'M4 20L20 4'],
  ['rect', 'Persegi pjg.', 'M3 6h18v12H3z'],
  ['square', 'Persegi', 'M5 5h14v14H5z'],
  ['ellipse', 'Elips', 'M3 12a9 6 0 1 0 18 0 9 6 0 1 0-18 0'],
  ['circle', 'Lingkaran', 'M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0'],
  ['triangle', 'Segitiga', 'M12 3L22 20H2z'],
  ['quad', 'Segiempat', 'M6 4l15 3-4 14L2 17z'],
  ['arc', 'Busur', 'M20 12a8 8 0 1 0-8 8v-8z'],
  ['bezier', 'Bézier', 'M3 19C3 0 21 24 21 5'],
  ['curve', 'Kurva', 'M3 18Q6 0 12 12T21 5']
];
let objects = [], selectedId = null, tool = 'select', nextId = 1;
let undoStack = [], redoStack = [], pendingStyle = null;
let gesture = null, preview = null, renderer, hitBuffer, app;
let toastTimer;
const names = Object.fromEntries(definitions.map(([id,label]) => [id,label]));
names.image = 'Gambar';

function selected() { return objects.find(o => o.id === selectedId); }
function style() { return {fill: $('fill').value, stroke: $('stroke').value,
  weight: +$('weight').value, filled: $('filled').checked}; }
function notify(message) {
  $('toast').textContent = message; $('toast').classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3000);
}
function checkpoint(before) {
  undoStack.push(before); if (undoStack.length > 40) undoStack.shift();
  redoStack = []; sync();
}
function flushStyle() {
  if (pendingStyle) { checkpoint(pendingStyle); pendingStyle = null; }
}
function mutate(action) {
  flushStyle(); const before = cloneScene(objects); action(); checkpoint(before); refresh();
}
function chooseTool(value) {
  flushStyle(); tool = value;
  document.querySelectorAll('.tool').forEach(b => {
    const active = b.dataset.tool === tool;
    b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));
  });
  $('hint').textContent = tool === 'select' ? 'Pilih & geser: klik objek untuk mengeditnya.' :
    tool === 'point' ? 'Klik kanvas untuk menambahkan titik.' : `${names[tool]}: klik dan tarik di kanvas.`;
  if (renderer) renderer.elt.style.cursor = tool === 'select' ? 'default' : 'crosshair';
}
function sync() {
  const o = selected();
  $('object-count').textContent = `${objects.length} objek`;
  $('empty-state').hidden = objects.length > 0;
  $('undo').disabled = !undoStack.length; $('redo').disabled = !redoStack.length;
  $('clear').disabled = !objects.length;
  $('transform').disabled = !o; $('select-note').hidden = !!o;
  $('selected-type').textContent = o ? names[o.type] : 'Belum dipilih';
  $('style-target').textContent = o ? 'Objek terpilih' : 'Objek baru';
  if (o) {
    $('pos-x').value = Math.round(o.x); $('pos-y').value = Math.round(o.y);
    $('rotation').value = o.rotation; $('scale').value = o.scale * 100;
    $('fill').value = o.fill; $('stroke').value = o.stroke;
    $('weight').value = o.weight; $('filled').checked = o.filled;
  }
  $('rotation-value').textContent = `${o ? Math.round(o.rotation) : 0}°`;
  $('scale-value').textContent = `${o ? Math.round(o.scale * 100) : 100}%`;
  $('fill-code').textContent = $('fill').value.toUpperCase();
  $('stroke-code').textContent = $('stroke').value.toUpperCase();
  $('weight-value').textContent = `${$('weight').value} px`;
}
function refresh() { sync(); if (app) app.redraw(); }
function undo() {
  flushStyle(); if (!undoStack.length) return;
  redoStack.push(cloneScene(objects)); objects = undoStack.pop(); selectedId = null; refresh();
}
function redo() {
  flushStyle(); if (!redoStack.length) return;
  undoStack.push(cloneScene(objects)); objects = redoStack.pop(); selectedId = null; refresh();
}
function removeSelected() {
  if (!selected()) return;
  mutate(() => { objects = objects.filter(o => o.id !== selectedId); selectedId = null; });
}

// Setiap objek dirender dalam koordinat lokal. push/pop membatasi transformasi ke satu objek.
function drawObject(g, o, hitColor = null) {
  g.push(); g.translate(o.x, o.y); g.rotate(o.rotation * Math.PI / 180); g.scale(o.scale);
  g.stroke(hitColor || o.stroke); g.strokeWeight(hitColor ? Math.max(o.weight, 10 / o.scale) : o.weight);
  g.strokeCap(g.ROUND); g.strokeJoin(g.ROUND);
  if (o.filled) g.fill(hitColor || o.fill); else g.noFill();
  const w = o.w, h = o.h, a = o.points?.[0], b = o.points?.[1];
  switch (o.type) {
    case 'point': g.point(0,0); break;
    case 'line': g.line(a.x,a.y,b.x,b.y); break;
    case 'rect': g.rect(-w/2,-h/2,w,h); break;
    case 'square': g.square(-w/2,-w/2,w); break;
    case 'ellipse': g.ellipse(0,0,w,h); break;
    case 'circle': g.circle(0,0,w); break;
    case 'triangle': g.triangle(0,-h/2,w/2,h/2,-w/2,h/2); break;
    case 'quad': g.quad(-w*.3,-h/2,w/2,-h*.25,w*.3,h/2,-w/2,h*.25); break;
    case 'arc': g.arc(0,0,w,h,0,Math.PI*1.5,o.filled ? g.PIE : g.OPEN); break;
    case 'bezier':
      g.noFill(); g.bezier(-w/2,h/2,-w/2,-h/2,w/2,h/2,w/2,-h/2); break;
    case 'curve':
      g.noFill(); g.curve(-w,-h*2,-w/2,0,w/2,0,w,h*2); break;
    case 'brush':
      g.noFill();
      if (o.points.length === 1) g.point(o.points[0].x,o.points[0].y);
      else { g.beginShape(); o.points.forEach(pt => g.vertex(pt.x,pt.y)); g.endShape(); }
      break;
    case 'image':
      if (hitColor) {g.noStroke();g.fill(hitColor);g.rect(-w/2,-h/2,w,h);}
      else g.image(o.image,-w/2,-h/2,w,h);
      break;
  }
  g.pop();
}
function drawSelection(p, o) {
  p.push(); p.translate(o.x,o.y); p.rotate(o.rotation*Math.PI/180);
  const pad = 8, w = Math.max(12,o.w*o.scale) + o.weight*o.scale + pad*2;
  const h = Math.max(12,o.h*o.scale) + o.weight*o.scale + pad*2;
  p.noFill(); p.stroke('#d94825'); p.strokeWeight(1.5);
  p.drawingContext.setLineDash([6,5]); p.rect(-w/2,-h/2,w,h);
  p.drawingContext.setLineDash([]); p.fill('#ffffff');
  for (const x of [-w/2,w/2]) for (const y of [-h/2,h/2]) p.rect(x-4,y-4,8,8);
  p.pop();
}
function hitAt(pos) {
  const px = hitBuffer.get(Math.floor(pos.x), Math.floor(pos.y));
  const index = (px[0] + px[1]*256 + px[2]*65536) - 1;
  return px[3] > 200 && index >= 0 && index < objects.length ? objects[index] : null;
}
function coordinates(event) {
  const box = renderer.elt.getBoundingClientRect();
  return {x: Math.max(0,Math.min(WIDTH-1,(event.clientX-box.left)*WIDTH/box.width)),
    y: Math.max(0,Math.min(HEIGHT-1,(event.clientY-box.top)*HEIGHT/box.height))};
}
function pointerDown(event) {
  if (event.button !== 0 || gesture) return;
  event.preventDefault(); flushStyle(); renderer.elt.setPointerCapture(event.pointerId);
  const start = coordinates(event);
  if (tool === 'select') {
    const object = hitAt(start); selectedId = object?.id ?? null;
    gesture = object ? { mode:'move', pointer:event.pointerId, start, before:cloneScene(objects), x:object.x, y:object.y } : null;
  } else {
    gesture = {mode:'draw', pointer:event.pointerId, start, before:cloneScene(objects), style:style()};
    preview = makeShape(tool,start,start,gesture.style,nextId++);
    if (tool === 'brush') preview.points = [{x:0,y:0}];
    if (tool === 'point') {preview.x=start.x;preview.y=start.y;preview.w=1;preview.h=1;}
    document.body.classList.add('drawing');
  }
  refresh();
}
function pointerMove(event) {
  if (!gesture || gesture.pointer !== event.pointerId) return;
  const pos = coordinates(event);
  if (gesture.mode === 'move') {
    const o = selected(); if (!o) return;
    o.x = gesture.x + pos.x-gesture.start.x; o.y = gesture.y + pos.y-gesture.start.y;
  } else if (tool === 'brush') {
    const pt = {x:pos.x-gesture.start.x,y:pos.y-gesture.start.y};
    const last = preview.points.at(-1);
    if (Math.hypot(pt.x-last.x,pt.y-last.y) > 1) preview.points.push(pt);
  } else if (tool !== 'point') preview = makeShape(tool,gesture.start,pos,gesture.style,preview.id);
  refresh();
}
function pointerUp(event, canceled = false) {
  if (!gesture || gesture.pointer !== event.pointerId) return;
  if (!canceled) pointerMove(event);
  const before = gesture.before;
  if (canceled) objects = before;
  else if (gesture.mode === 'draw' && preview) {
    if (tool === 'brush') centerBrush(preview);
    if (preview.w < 3 && preview.h < 3 && !['point','brush'].includes(tool)) {
      notify('Klik dan tarik untuk menentukan ukuran bentuk.');
    } else { objects.push(preview); selectedId = preview.id; checkpoint(before); }
  } else if (gesture.mode === 'move') {
    const o = selected();
    if (o && (o.x !== gesture.x || o.y !== gesture.y)) checkpoint(before);
  }
  preview = null; gesture = null; document.body.classList.remove('drawing');
  if (renderer.elt.hasPointerCapture(event.pointerId)) renderer.elt.releasePointerCapture(event.pointerId);
  refresh();
}

// Panel alat memakai ikon SVG; gambar di kanvas tetap memakai API p5.js.
for (const [id,label,path] of definitions) {
  const b = document.createElement('button'); b.className='tool'; b.dataset.tool=id;
  b.title = id === 'select' ? 'Pilih & geser (V)' : label;
  b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg><span>${label}</span>`;
  b.addEventListener('click',() => chooseTool(id)); $('tools').append(b);
}
for (const color of ['#e85d3b','#f1b72d','#5b8c65','#3b79b5','#8864b5','#24262b','#ffffff']) {
  const b = document.createElement('button'); b.className='swatch'; b.style.background=color;
  b.title=color; b.setAttribute('aria-label',`Warna isi ${color}`);
  b.onclick=()=> { $('fill').value=color; const o=selected(); if(o) mutate(()=>o.fill=color); else refresh(); };
  $('swatches').append(b);
}
function bindProperty(id, apply) {
  const input=$(id);
  input.addEventListener('input',()=> {
    const o=selected();
    if(o) {
      if(!pendingStyle) pendingStyle=cloneScene(objects);
      apply(o,input);
    }
    refresh();
  });
  input.addEventListener('change',flushStyle);
}
bindProperty('fill',(o,i)=>o.fill=i.value);
bindProperty('stroke',(o,i)=>o.stroke=i.value);
bindProperty('filled',(o,i)=>o.filled=i.checked);
bindProperty('weight',(o,i)=>o.weight=+i.value);
bindProperty('rotation',(o,i)=>o.rotation=+i.value);
bindProperty('scale',(o,i)=>o.scale=+i.value/100);
// Posisi menggunakan change agar angka tidak diubah ketika pengguna masih mengetik.
for (const [id,key,min,max] of [['pos-x','x',-2400,3600],['pos-y','y',-1600,2400]]) {
  $(id).onchange=()=> { const o=selected(), value=+$(id).value;
    if(o && Number.isFinite(value)) mutate(()=>o[key]=Math.max(min,Math.min(max,value)));
    else refresh();
  };
}
$('undo').onclick=undo; $('redo').onclick=redo; $('delete').onclick=removeSelected;
$('reset-transform').onclick=()=> {const o=selected(); if(o) mutate(()=>{o.rotation=0;o.scale=1;});};
$('clear').onclick=()=> $('clear-dialog').showModal();
$('clear-cancel').onclick=()=> $('clear-dialog').close();
$('clear-confirm').onclick=()=> {mutate(()=>{objects=[];selectedId=null;});$('clear-dialog').close();};
$('import-open').onclick=()=> { $('import-error').textContent=''; $('import-dialog').showModal(); };
$('import-close').onclick=()=> $('import-dialog').close();
$('image-file').onchange=()=> {if($('image-file').files.length) $('image-url').value='';};
$('image-url').oninput=()=> {if($('image-url').value) $('image-file').value='';};

async function importImage(event) {
  event.preventDefault();
  if(!app) return;
  const file=$('image-file').files[0]; let source=$('image-url').value.trim();
  $('import-error').textContent='';
  if(!file && !source) { $('import-error').textContent='Pilih file atau masukkan URL gambar terlebih dahulu.'; return; }
  if(file && (file.size>10*1024*1024 || !/^image\/(png|jpeg|webp|gif)$/.test(file.type))) {
    $('import-error').textContent='Gunakan PNG, JPG, WebP, atau GIF dengan ukuran maksimal 10 MB.'; return;
  }
  if(!file) {
    try {const url=new URL(source);if(!['http:','https:'].includes(url.protocol)) throw Error();}
    catch {$('import-error').textContent='URL harus menggunakan http:// atau https://.'; return;}
  }
  $('import-submit').disabled=true; $('import-submit').textContent='Memuat gambar…';
  try {
    if(file) source=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
    const loaded=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('timeout')),20000);
      // loadImage memenuhi fitur pemuatan gambar dari sumber (file maupun URL).
      app.loadImage(source,img=>{clearTimeout(timer);resolve(img);},err=>{clearTimeout(timer);reject(err);});
    });
    if(!loaded.width || !loaded.height) throw Error('Gambar kosong');
    if(loaded.width*loaded.height>2400*2400) loaded.resize(loaded.width>=loaded.height ? 2400 : 0,loaded.width>=loaded.height ? 0 : 2400);
    const ratio=Math.min(1,WIDTH*.7/loaded.width,HEIGHT*.7/loaded.height);
    mutate(()=> {const o={id:nextId++,type:'image',x:WIDTH/2,y:HEIGHT/2,w:loaded.width*ratio,h:loaded.height*ratio,
      rotation:0,scale:1,...style(),image:loaded};objects.push(o);selectedId=o.id;});
    chooseTool('select'); $('import-dialog').close(); $('image-file').value='';$('image-url').value='';
    notify('Gambar ditambahkan. Tarik untuk memindahkannya.');
  } catch { $('import-error').textContent='Gambar gagal dimuat. Periksa tautan/koneksi atau gunakan file dari perangkat (sumber URL mungkin memblokir CORS).'; }
  finally {$('import-submit').disabled=false;$('import-submit').textContent='Tambahkan ke kanvas';}
}
$('import-form').onsubmit=importImage;
$('export').onclick=()=> {
  if(!app) return;
  const output=app.createGraphics(WIDTH,HEIGHT); output.pixelDensity(1); output.background(255);
  objects.forEach(o=>drawObject(output,o));
  try {
    output.canvas.toBlob(blob=> {
      if(!blob){notify('PNG gagal dibuat. Coba impor gambar dari file.');output.remove();return;}
      const url=URL.createObjectURL(blob), a=document.createElement('a');
      a.href=url;a.download='mini-paint.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      output.remove();notify('PNG siap diunduh.');
    },'image/png');
  } catch {output.remove();notify('Ekspor gagal. Ganti gambar URL dengan file dari perangkat.');}
};
document.addEventListener('keydown',event=> {
  if(document.querySelector('dialog[open]') || ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
  if(gesture) return;
  const modifier=event.ctrlKey||event.metaKey;
  if(modifier && event.key.toLowerCase()==='z') {event.preventDefault();event.shiftKey?redo():undo();}
  else if(modifier && event.key.toLowerCase()==='y') {event.preventDefault();redo();}
  else if(event.key==='Delete'||event.key==='Backspace') {event.preventDefault();removeSelected();}
  else if(event.key.toLowerCase()==='v') chooseTool('select');
  else if(event.key==='Escape') {selectedId=null;refresh();}
  else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key) && selected()) {
    event.preventDefault();const d=event.shiftKey?10:1;mutate(()=>{const o=selected();o.x+=(event.key==='ArrowRight'?d:event.key==='ArrowLeft'?-d:0);o.y+=(event.key==='ArrowDown'?d:event.key==='ArrowUp'?-d:0);});
  }
});
chooseTool('select'); sync();
if(typeof p5==='undefined') {
  $('load-error').hidden=false; $('empty-state').hidden=true;
  $('export').disabled=true; $('import-open').disabled=true;
} else {
  app=new p5(p=> {
    p.setup=()=> {
      p.pixelDensity(1);renderer=p.createCanvas(WIDTH,HEIGHT);renderer.parent('canvas-host');
      renderer.elt.setAttribute('aria-label','Kanvas gambar 1200 kali 800 piksel. Gunakan alat untuk menggambar, lalu Pilih untuk mengedit.');
      hitBuffer=p.createGraphics(WIDTH,HEIGHT);hitBuffer.pixelDensity(1);
      renderer.elt.addEventListener('pointerdown',pointerDown);
      renderer.elt.addEventListener('pointermove',pointerMove);
      renderer.elt.addEventListener('pointerup',e=>pointerUp(e));
      renderer.elt.addEventListener('pointercancel',e=>pointerUp(e,true));
      p.noLoop();
    };
    p.draw=()=> {
      p.background(255);hitBuffer.clear();
      objects.forEach((o,i)=> {drawObject(p,o);const n=i+1;drawObject(hitBuffer,o,[n%256,Math.floor(n/256)%256,Math.floor(n/65536)%256]);});
      if(preview) drawObject(p,preview);
      const o=selected();if(o&&!preview) drawSelection(p,o);
    };
  });
}
