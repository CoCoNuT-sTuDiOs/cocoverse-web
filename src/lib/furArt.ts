export interface Art {
  /** "kitten" is kept so existing callers still type-check. */
  id: "kitten" | "panda";
  /** Centre of the drawing in CSS px from the centre of the button, and its size. */
  x: number;
  y: number;
  w: number;
  h: number;
}

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

// Each colour is a channel of the label texture. The fur turns them into the page's inks.
const BLACK = "#000"; // tone 0: the page's text colour
const WHITE = "#f00"; // tone 1
const IRIS = "#00f"; // tone 3: the eyes' colour comes from the third entry in the page's inks

function ell(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: string, rot = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

/** A filled shape with rounded corners. */
function blob(ctx: Ctx, pts: Pt[], color: string, round: number) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = round;
  ctx.lineJoin = "round";
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function line(ctx: Ctx, color: string, width: number, path: () => void) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  path();
  ctx.stroke();
}

/** Draws the same thing again, flipped left to right across the 400 px wide drawing. */
function mirror(ctx: Ctx, draw: () => void) {
  ctx.save();
  ctx.translate(400, 0);
  ctx.scale(-1, 1);
  draw();
  ctx.restore();
}

/** A classic panda head. Drawn in a 400 by 500 box, with room below for the wordmark. */
function panda(ctx: Ctx) {
  // Ears: round black discs behind the head.
  const ear = () => ell(ctx, 86, 88, 52, 50, BLACK);
  ear();
  mirror(ctx, ear);

  // Head: broad and round, a little fuller at the cheeks.
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(200, 66);
  ctx.bezierCurveTo(284, 66, 354, 118, 354, 202);
  ctx.bezierCurveTo(354, 282, 290, 336, 200, 336);
  ctx.bezierCurveTo(110, 336, 46, 282, 46, 202);
  ctx.bezierCurveTo(46, 118, 116, 66, 200, 66);
  ctx.closePath();
  ctx.fill();

  // Eye patches: slanted ovals, lower at the outer side.
  const eye = () => {
    ell(ctx, 134, 210, 36, 58, BLACK, 0.55);
    ell(ctx, 148, 206, 18, 19, WHITE); // eye white
    ell(ctx, 149, 207, 14, 15, IRIS); // iris
    ell(ctx, 149, 207, 8, 9, BLACK); // pupil
    ell(ctx, 144, 200, 5, 5, WHITE); // highlight
    ell(ctx, 155, 214, 2.5, 2.5, WHITE);
  };
  eye();
  mirror(ctx, eye);

  // Nose: a soft rounded triangle, with a small shine.
  blob(ctx, [[176, 246], [224, 246], [200, 268]], BLACK, 18);
  ell(ctx, 191, 247, 8, 3.5, WHITE);

  // Mouth: a short line down, then a gentle smile.
  line(ctx, BLACK, 5, () => {
    ctx.moveTo(200, 270);
    ctx.lineTo(200, 284);
    ctx.moveTo(200, 284);
    ctx.quadraticCurveTo(186, 304, 160, 290);
    ctx.moveTo(200, 284);
    ctx.quadraticCurveTo(214, 304, 240, 290);
  });
}

/** Draws the art centred at the origin, fitted into its width and height. */
export function drawArt(ctx: Ctx, art: Art) {
  const s = Math.min(art.w / 400, art.h / 500);
  ctx.save();
  ctx.scale(s, s);
  ctx.translate(-200, -250);
  panda(ctx);
  ctx.restore();
}