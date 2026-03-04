// Rounding for SVG — prevents hydration mismatch (float differences server vs client).
export const roundSvg = (n: number) => Math.round(n * 1000) / 1000;

// Helper: 6 percentage values → polygon 6-radar (hexagon).
export function radar6Polygon(
  values: [number, number, number, number, number, number],
) {
  const cx = 50,
    cy = 50,
    maxR = 40;
  const angles = [0, 60, 120, 180, 240, 300];
  const pts = values.map((v, i) => {
    const r = (maxR * v) / 100;
    const rad = (angles[i] * Math.PI) / 180;
    return {
      x: roundSvg(cx + r * Math.sin(rad)),
      y: roundSvg(cy - r * Math.cos(rad)),
    };
  });
  const points = pts.map((p) => `${p.x},${p.y}`).join(" ");
  return { points, pts };
}

// Helper: n percentage values → polygon n-radar (equal angles, first axis at top).
export function radarNPolygon(values: number[]) {
  const n = values.length;
  const cx = 50,
    cy = 50,
    maxR = 40;
  const pts = values.map((v, i) => {
    const angle = (i * 360) / n;
    const rad = (angle * Math.PI) / 180;
    const r = (maxR * v) / 100;
    return {
      x: roundSvg(cx + r * Math.sin(rad)),
      y: roundSvg(cy - r * Math.cos(rad)),
    };
  });
  return { points: pts.map((p) => `${p.x},${p.y}`).join(" "), pts };
}
