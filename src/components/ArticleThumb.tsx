import { Article } from '@/lib/articles';

// Placeholder artwork until each article has its own image: a hairline diagram
// in the style of the hero, one motif per article.
type Motif = 'rings' | 'orbits' | 'grid' | 'nodes' | 'well' | 'veil' | 'split';

const MOTIFS: Record<string, Motif> = {
  'additional-apy': 'rings',
  'block-rewards': 'orbits',
  'performance-delegation': 'grid',
  'composable-obsol': 'nodes',
  'provisioned-apy': 'well',
  'confidential-staking': 'veil',
  'liquid-vs-native': 'split',
};

// Deterministic dust so server and client render the same dots
function dust(seed: string, count: number) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({ x: next() * 320, y: next() * 200, r: 0.6 + next() * 0.9 }));
}

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, vectorEffect: 'non-scaling-stroke' as const };

function Motif({ motif }: { motif: Motif }) {
  switch (motif) {
    case 'rings':
      return (
        <g>
          {[18, 34, 52, 72, 94, 118].map((r, i) => (
            <ellipse key={r} cx={160} cy={104} rx={r * 1.25} ry={r * 0.5} {...line} opacity={0.5 - i * 0.06} />
          ))}
          <circle cx={160} cy={104} r={3} fill="currentColor" />
        </g>
      );
    case 'orbits':
      return (
        <g transform="rotate(-10 160 100)">
          {[50, 72, 96, 122].map((r, i) => (
            <ellipse key={r} cx={160} cy={100} rx={r * 1.3} ry={r * 0.34} {...line} opacity={0.42 - i * 0.07} />
          ))}
          <circle cx={160} cy={100} r={26} fill="currentColor" />
        </g>
      );
    case 'grid':
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1={20} x2={300} y1={60 + i * i * 1.8} y2={60 + i * i * 1.8} {...line} opacity={0.3} />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`v${i}`} x1={160 + (i - 6) * 9} y1={60} x2={160 + (i - 6) * 40} y2={204} {...line} opacity={0.3} />
          ))}
          <rect x={196} y={98} width={18} height={14} fill="currentColor" />
        </g>
      );
    case 'nodes': {
      const pts: [number, number][] = [
        [60, 70], [118, 46], [170, 92], [236, 58], [274, 120], [204, 150], [112, 140], [52, 150],
      ];
      return (
        <g>
          {pts.map(([x, y], i) =>
            pts.slice(i + 1, i + 3).map(([x2, y2]) => <line key={`${i}-${x2}`} x1={x} y1={y} x2={x2} y2={y2} {...line} opacity={0.32} />)
          )}
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 2 ? 6 : 3} fill={i === 2 ? 'currentColor' : 'var(--color-paper)'} stroke="currentColor" />
          ))}
        </g>
      );
    }
    case 'well':
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const u = (i + 1) / 8;
            return <ellipse key={i} cx={160} cy={150 - 70 * u} rx={14 + 150 * u * u} ry={(14 + 150 * u * u) * 0.28} {...line} opacity={0.42 - u * 0.2} />;
          })}
          <circle cx={160} cy={146} r={3} fill="currentColor" />
        </g>
      );
    case 'veil':
      return (
        <g>
          <circle cx={160} cy={100} r={52} fill="currentColor" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} x2={320} y1={34 + i * 12} y2={34 + i * 12} stroke="var(--color-paper)" strokeWidth={4} />
          ))}
          <circle cx={160} cy={100} r={64} {...line} opacity={0.3} />
        </g>
      );
    case 'split':
      return (
        <g>
          <line x1={160} x2={160} y1={30} y2={170} {...line} opacity={0.5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={56} y={46 + i * 22} width={64} height={12} {...line} opacity={0.4} />
          ))}
          {[22, 38, 54].map((r, i) => (
            <circle key={r} cx={240} cy={100} r={r} {...line} opacity={0.45 - i * 0.1} />
          ))}
          <circle cx={240} cy={100} r={4} fill="currentColor" />
        </g>
      );
  }
}

/** The article's image, or a hairline placeholder until it has one. */
export function ArticleThumb({ article, className = '' }: { article: Article; className?: string }) {
  const frame = `overflow-hidden rounded-[4px] border border-rule bg-paper ${className}`;
  if (article.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- article images are plain static files
      <img src={article.image} alt="" className={`aspect-[8/5] w-full object-cover ${frame}`} />
    );
  }
  return (
    <svg viewBox="0 0 320 200" aria-hidden className={`aspect-[8/5] w-full text-ink ${frame}`}>
      {dust(article.slug, 26).map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="currentColor" opacity={0.35} />
      ))}
      <Motif motif={MOTIFS[article.slug] ?? 'rings'} />
    </svg>
  );
}
