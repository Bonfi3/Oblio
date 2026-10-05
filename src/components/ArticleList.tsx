import Link from 'next/link';
import { Article, formatDate } from '@/lib/articles';

export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <ul className="border-t border-ink">
      {articles.map((a) => (
        <li key={a.slug} className="border-b border-rule">
          <Link
            href={`/articles/${a.slug}`}
            className="group grid gap-x-8 gap-y-2 py-6 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-baseline"
          >
            <div className="flex gap-3 text-[13px] text-graphite md:flex-col md:gap-1">
              <span className="font-medium text-ink">{a.category}</span>
              <time dateTime={a.date} className="tabular">
                {formatDate(a.date)}
              </time>
            </div>
            <div className="min-w-0">
              <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.015em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                {a.title}
              </h3>
              <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-graphite">{a.excerpt}</p>
            </div>
            <span className="tabular whitespace-nowrap text-[13px] text-graphite">
              {a.minutes} min read <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
