import type { Metadata } from 'next';
import { ArticleList } from '@/components/ArticleList';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ARTICLES } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'Articles · Oblio',
  description: 'Research, product notes and guides on confidential liquid staking.',
};

export default function ArticlesPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-14 sm:px-8 lg:py-20">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[13px] font-medium text-graphite">Research and updates</p>
          <h1 className="mt-3 text-[38px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[48px]">Articles</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-graphite">
            How Oblio earns, how it protects positions, and how to think about staking SOL at scale.
          </p>
        </div>
        <ArticleList articles={ARTICLES} />
      </main>
      <SiteFooter />
    </div>
  );
}
