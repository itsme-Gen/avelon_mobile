export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Insets {
  top: number;
  bottom: number;
}

export const HOLE_PADDING = 8;
export const HOLE_RADIUS = 16;
const EDGE = 16;
const GAP = 12;

/** The measured element grown by the padding, kept on screen. */
export function padRect(rect: Rect, screen: { width: number; height: number }, padding = HOLE_PADDING): Rect {
  const x = Math.max(4, rect.x - padding);
  const y = Math.max(4, rect.y - padding);
  const right = Math.min(screen.width - 4, rect.x + rect.width + padding);
  const bottom = Math.min(screen.height - 4, rect.y + rect.height + padding);
  return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}

/**
 * Full-screen rectangle with a rounded hole, for an evenodd fill. A worklet so
 * reanimated can rebuild it on the UI thread while the hole moves. Everything it
 * needs comes in as arguments: a worklet can't see module constants on the UI thread.
 */
export function holePath(width: number, height: number, x: number, y: number, w: number, h: number, radius: number): string {
  "worklet";
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const outer = `M0 0H${width}V${height}H0Z`;
  if (w <= 0 || h <= 0) return outer;
  return (
    outer +
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}` +
    `V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  );
}

/**
 * Where the tooltip card goes: below the hole if it fits, otherwise above,
 * otherwise centred. Horizontally it follows the hole but stays inside the
 * screen edges.
 */
export function placeTooltip(
  hole: Rect | null,
  card: { width: number; height: number },
  screen: { width: number; height: number },
  insets: Insets,
): { left: number; top: number; placement: "below" | "above" | "center" } {
  const width = Math.min(card.width, screen.width - EDGE * 2);
  const centerLeft = (screen.width - width) / 2;
  if (!hole) {
    return { left: centerLeft, top: (screen.height - card.height) / 2, placement: "center" };
  }

  const left = Math.min(
    Math.max(EDGE, hole.x + hole.width / 2 - width / 2),
    screen.width - EDGE - width,
  );
  const spaceBelow = screen.height - insets.bottom - (hole.y + hole.height);
  const spaceAbove = hole.y - insets.top;

  if (spaceBelow >= card.height + GAP + EDGE) {
    return { left, top: hole.y + hole.height + GAP, placement: "below" };
  }
  if (spaceAbove >= card.height + GAP + EDGE) {
    return { left, top: hole.y - GAP - card.height, placement: "above" };
  }
  return { left: centerLeft, top: (screen.height - card.height) / 2, placement: "center" };
}
