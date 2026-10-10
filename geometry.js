/* Perhitungan bentuk dipisahkan agar lebih mudah dibaca dan diuji. */
(function (root) {
  const TYPES = ['point', 'line', 'rect', 'square', 'ellipse', 'circle', 'triangle', 'quad', 'arc', 'brush', 'bezier', 'curve'];
  function makeShape(type, start, end, style, id) {
    let dx = end.x - start.x, dy = end.y - start.y;
    if (type === 'square' || type === 'circle') {
      const side = Math.max(Math.abs(dx), Math.abs(dy));
      dx = (dx < 0 ? -1 : 1) * side;
      dy = (dy < 0 ? -1 : 1) * side;
    }
    const w = Math.max(1, Math.abs(dx)), h = Math.max(1, Math.abs(dy));
    return { id, type, x: start.x + dx / 2, y: start.y + dy / 2, w, h,
      rotation: 0, scale: 1, ...style,
      points: [{x: -dx / 2, y: -dy / 2}, {x: dx / 2, y: dy / 2}] };
  }
  function centerBrush(shape) {
    const xs = shape.points.map(p => p.x), ys = shape.points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    shape.x += cx; shape.y += cy;
    shape.w = Math.max(1, maxX - minX); shape.h = Math.max(1, maxY - minY);
    shape.points = shape.points.map(p => ({x: p.x - cx, y: p.y - cy}));
    return shape;
  }
  // Salin data objek; referensi gambar p5 tetap dipakai agar tidak disalin per piksel.
  function cloneScene(scene) {
    return scene.map(o => ({ ...o, points: o.points?.map(p => ({...p})) }));
  }
  const api = { TYPES, makeShape, centerBrush, cloneScene };
  if (typeof module !== 'undefined') module.exports = api;
  else root.PaintGeometry = api;
})(typeof window !== 'undefined' ? window : globalThis);
