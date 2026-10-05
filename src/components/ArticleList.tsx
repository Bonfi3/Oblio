import Link from 'next/link';
import { ArticleThumb } from '@/components/ArticleThumb';
import { Reveal } from '@/components/motion';
import { Article, formatDate } from '@/lib/articles';

export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <ul className="border-t border-ink">
      {articles.map((a, i) => (
        <Reveal as="li" key={a.slug} delay={i * 90} className="border-b border-rule">
          <Link
            href={`/articles/${a.slug}`}
            className="group grid gap-x-8 gap-y-3 py-6 md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-start lg:grid-cols-[240px_minmax(0,1fr)_auto]"
          >
            <ArticleThumb article={a} className="transition-[border-color] duration-300 group-hover:border-ink" />
            <div className="min-w-0">
              <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.015em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                {a.title}
              </h3>
              <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-graphite">{a.excerpt}</p>
              <p className="tabular mt-4 flex flex-wrap items-center gap-x-2 text-[13px] text-graphite">
                <span className="font-medium text-ink">{a.category}</span>
                <span aria-hidden>·</span>
                <time dateTime={a.date}>{formatDate(a.date)}</time>
              </p>
            </div>
            <span className="tabular whitespace-nowrap text-[13px] text-graphite">
              {a.minutes} min read <span aria-hidden>→</span>
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
