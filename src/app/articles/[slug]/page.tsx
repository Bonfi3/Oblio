import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleList } from '@/components/ArticleList';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ARTICLES, Block, formatDate, getArticle } from '@/lib/articles';

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps<'/articles/[slug]'>): Promise<Metadata> {
  const article = getArticle((await props.params).slug);
  return article ? { title: `${article.title} · Oblio`, description: article.excerpt } : {};
}

function Content({ block }: { block: Block }) {
  if ('h' in block) {
    return <h2 className="mt-12 text-[24px] font-semibold leading-tight tracking-[-0.02em]">{block.h}</h2>;
  }
  if ('list' in block) {
    return (
      <ul className="mt-5 space-y-3 border-l border-ink pl-5">
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if ('note' in block) {
    return <p className="mt-10 rounded-[6px] border border-rule bg-mist px-5 py-4 text-[15px] text-graphite">{block.note}</p>;
  }
  return <p className="mt-5">{block.p}</p>;
}

export default async function ArticlePage(props: PageProps<'/articles/[slug]'>) {
  const article = getArticle((await props.params).slug);
  if (!article) notFound();

  const more = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-[720px]">
            <nav className="text-[13px] text-graphite">
              <Link href="/articles" className="hover:text-ink">
                Articles
              </Link>
              <span className="px-2" aria-hidden>
                /
              </span>
              <span className="text-ink">{article.category}</span>
            </nav>

            <h1 className="mt-6 text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[46px]">
              {article.title}
            </h1>
            <p className="mt-5 text-[19px] leading-relaxed text-graphite">{article.excerpt}</p>

            <div className="tabular mt-8 flex gap-6 border-t border-ink pt-3 text-[13px] text-graphite">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span>{article.minutes} min read</span>
            </div>

            <div className="mt-6 text-[17px] leading-[1.7]">
              {article.body.map((block, i) => (
                <Content key={i} block={block} />
              ))}
            </div>

            <div className="mt-16 flex flex-col items-start justify-between gap-4 rounded-[6px] border border-rule p-6 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold">Stake SOL with Oblio</p>
                <p className="mt-1 text-sm text-graphite">Receive obSOL and keep your position out of view.</p>
              </div>
              <Link
                href="/"
                className="hover-lift inline-flex h-11 items-center rounded-[4px] bg-ink px-5 text-[15px] font-medium text-paper hover:bg-[#262626]"
              >
                Go to staking
              </Link>
            </div>
          </div>
        </article>

        <section aria-labelledby="more-title" className="border-t border-rule bg-mist/60">
          <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
            <h2 id="more-title" className="mb-8 text-[24px] font-semibold tracking-[-0.02em]">
              More articles
            </h2>
            <ArticleList articles={more} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
