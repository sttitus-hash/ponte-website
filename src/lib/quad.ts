/**
 * Projective transform that maps a w×h rectangle (origin top-left) onto an arbitrary
 * quadrilateral, as a CSS `matrix3d(...)` string for `transform-origin: 0 0`.
 * Used to place flat HTML onto the perspective-skewed shapes drawn in Figma.
 */
export type Quad = [[number, number], [number, number], [number, number], [number, number]]; // TL, TR, BR, BL

export function quadMatrix(w: number, h: number, q: Quad): string {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const hh = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(6)).join(",")})`;
}
