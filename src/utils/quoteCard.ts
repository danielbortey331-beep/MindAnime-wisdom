export interface QuoteCardContent {
  quote: string;
  title: string;
  category: string;
}

const WIDTH = 1080;
const HEIGHT = 1920;
const QUOTE_BOX_HEIGHT = 730;
const QUOTE_BOX_CENTER_Y = 880;
const QUOTE_SIZES = [84, 72, 62, 54];
const SERIF = 'Fraunces, Georgia, serif';
const SANS = 'Inter, system-ui, sans-serif';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitQuote(
  ctx: CanvasRenderingContext2D,
  quote: string,
  maxWidth: number,
): { lines: string[]; size: number; lineHeight: number } {
  let fallback = { lines: [] as string[], size: QUOTE_SIZES[0], lineHeight: 0 };
  for (const size of QUOTE_SIZES) {
    ctx.font = `500 ${size}px ${SERIF}`;
    const lineHeight = Math.round(size * 1.3);
    const lines = wrapText(ctx, quote, maxWidth);
    fallback = { lines, size, lineHeight };
    if (lines.length * lineHeight <= QUOTE_BOX_HEIGHT) return fallback;
  }
  const maxLines = Math.floor(QUOTE_BOX_HEIGHT / fallback.lineHeight);
  const shown = fallback.lines.slice(0, maxLines);
  shown[maxLines - 1] = `${shown[maxLines - 1]}…`;
  return { ...fallback, lines: shown };
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const base = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  base.addColorStop(0, '#0a0a0b');
  base.addColorStop(0.55, '#111113');
  base.addColorStop(1, '#0a0a0b');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(WIDTH / 2, QUOTE_BOX_CENTER_Y, 40, WIDTH / 2, QUOTE_BOX_CENTER_Y, 620);
  glow.addColorStop(0, 'rgba(212, 168, 74, 0.26)');
  glow.addColorStop(1, 'rgba(212, 168, 74, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = 'rgba(212, 168, 74, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, WIDTH - 120, HEIGHT - 120);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))),
      'image/png',
    );
  });
}

export async function renderQuoteCard({ quote, title, category }: QuoteCardContent): Promise<Blob> {
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');

  drawBackground(ctx);
  const maxWidth = WIDTH - 220;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `600 34px ${SANS}`;
  ctx.fillStyle = '#e8c87a';
  ctx.letterSpacing = '6px';
  ctx.fillText(category.toUpperCase(), WIDTH / 2, 300);

  ctx.font = `500 220px ${SERIF}`;
  ctx.fillStyle = 'rgba(212, 168, 74, 0.35)';
  ctx.fillText('\u201C', WIDTH / 2, 470);

  const { lines, size, lineHeight } = fitQuote(ctx, quote, maxWidth);
  ctx.font = `500 ${size}px ${SERIF}`;
  ctx.fillStyle = '#e4e4ea';
  ctx.letterSpacing = '0px';
  let y = QUOTE_BOX_CENTER_Y - (lines.length * lineHeight) / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += lineHeight;
  }

  ctx.font = `600 40px ${SANS}`;
  ctx.fillStyle = '#e8c87a';
  ctx.letterSpacing = '4px';
  wrapText(ctx, title.toUpperCase(), maxWidth)
    .slice(0, 2)
    .forEach((titleLine, i) => ctx.fillText(titleLine, WIDTH / 2, 1340 + i * 60));

  ctx.fillStyle = 'rgba(212, 168, 74, 0.4)';
  ctx.fillRect(WIDTH / 2 - 120, 1500, 240, 3);

  ctx.font = `600 72px ${SERIF}`;
  ctx.fillStyle = '#e4e4ea';
  ctx.letterSpacing = '0px';
  ctx.fillText('MindAnime', WIDTH / 2, 1600);

  ctx.font = `400 28px ${SANS}`;
  ctx.fillStyle = '#9a9aa6';
  ctx.letterSpacing = '8px';
  ctx.fillText('WISDOM FEED', WIDTH / 2, 1680);

  return canvasToBlob(canvas);
}
