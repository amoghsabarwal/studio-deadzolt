// Draws the visitor's keepsake: a branded card with their visitor number,
// sized for an Instagram story (1080 × 1920) or a post on X (1600 × 900).
// Everything is drawn on a canvas in the site's own fonts and colours, so
// the image can be shared or saved straight from the page.

import type { Visitor } from "./visitor";

export type KeepsakeFormat = "story" | "post";

export const SIZES: Record<KeepsakeFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  post: { w: 1600, h: 900 },
};

const INK = "#000000";
const PAPER = "#ededed";
const DIM = "#8c8c8c";
const LINE = "rgba(237, 237, 237, 0.14)";
const RED = "#ff1f1f";

export function visitorLabel(v: Visitor | null) {
  if (!v) return "";
  if (v.number == null) return v.code;
  return "No. " + (v.number < 10000 ? String(v.number).padStart(4, "0") : v.number.toLocaleString("en-US"));
}

function dateLabel(v: Visitor | null) {
  const d = v ? new Date(v.date) : new Date();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const images = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string) {
  if (!images.has(src)) {
    images.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      }),
    );
  }
  return images.get(src)!;
}

// The fonts next/font loaded, by their real family names.
async function fonts() {
  const root = getComputedStyle(document.documentElement);
  const text = root.getPropertyValue("--font-text").trim() || "Helvetica Neue, Arial, sans-serif";
  const mono = root.getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
  await Promise.all([
    document.fonts.load(`500 100px ${text}`),
    document.fonts.load(`400 100px ${text}`),
    document.fonts.load(`400 30px ${mono}`),
  ]).catch(() => {});
  return { text, mono };
}

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function setType(ctx: Ctx, font: string, color: string, spacing = "0px") {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.letterSpacing = spacing;
}

export async function drawKeepsake(canvas: HTMLCanvasElement, format: KeepsakeFormat, v: Visitor | null) {
  const { w, h } = SIZES[format];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d") as Ctx | null;
  if (!ctx) return;

  const [{ text, mono }, star, mark] = await Promise.all([
    fonts(),
    loadImage("/models/previews/deadzolt-star.webp"),
    loadImage("/brand/wordmark.svg"),
  ]);

  const story = format === "story";
  const pad = story ? 96 : 88;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);

  // The star, with a soft light behind it.
  const size = story ? 1000 : 860;
  const cx = story ? w / 2 : pad + size / 2 - 60;
  const cy = story ? 800 : h / 2;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.62);
  glow.addColorStop(0, "rgba(216, 221, 227, 0.12)");
  glow.addColorStop(1, "rgba(216, 221, 227, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(star, cx - size / 2, cy - size / 2, size, size);
  ctx.globalCompositeOperation = "source-over";

  // Copy column: the whole card on a story, the right half on a post.
  const left = story ? pad : 900;
  const right = w - pad;

  ctx.textBaseline = "alphabetic";
  const markW = story ? 300 : 260;
  ctx.drawImage(mark, left, pad - 8, markW, (markW * 61) / 583);
  setType(ctx, `400 ${story ? 24 : 22}px ${mono}`, DIM, "2px");
  ctx.textAlign = "right";
  ctx.fillText("A KEEPSAKE", right, pad + 20);
  ctx.textAlign = "left";

  const titleSize = story ? 112 : 84;
  const titleTop = story ? 1360 : 300;
  setType(ctx, `500 ${titleSize}px ${text}`, PAPER, `${-titleSize * 0.04}px`);
  ctx.fillText("Thank you", left, titleTop);
  ctx.fillText("for your time.", left, titleTop + titleSize * 1.02);

  const ruleY = story ? 1580 : 560;
  ctx.fillStyle = LINE;
  ctx.fillRect(left, ruleY, right - left, 2);

  const labelSize = story ? 22 : 20;
  const valueSize = story ? 64 : 52;
  const rowY = ruleY + (story ? 60 : 52);
  setType(ctx, `400 ${labelSize}px ${mono}`, DIM, "2px");
  ctx.fillText(v?.number == null ? "YOUR CODE" : "VISITOR", left, rowY);
  ctx.textAlign = "right";
  ctx.fillText("FIRST VISIT", right, rowY);
  ctx.textAlign = "left";

  setType(ctx, `500 ${valueSize}px ${text}`, RED, `${-valueSize * 0.02}px`);
  ctx.fillText(visitorLabel(v), left, rowY + valueSize + 16);
  setType(ctx, `400 ${valueSize * 0.62}px ${text}`, PAPER, "0px");
  ctx.textAlign = "right";
  ctx.fillText(dateLabel(v), right, rowY + valueSize + 12);
  ctx.textAlign = "left";

  setType(ctx, `400 ${labelSize}px ${mono}`, DIM, "2px");
  ctx.fillText("DEADZOLT.STUDIO", left, h - pad + 12);
  ctx.textAlign = "right";
  ctx.fillText("INDORE, IN", right, h - pad + 12);
  ctx.textAlign = "left";
}

export function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
}
