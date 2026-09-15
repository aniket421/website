import type { Metadata } from 'next';
import { site } from '@/lib/data/site';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  // An admin login has no business in a search index.
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const from = searchParams.from?.startsWith('/admin') ? searchParams.from : '/admin';

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-alt px-gutter py-16">
      <div className="w-full max-w-[420px] rounded-panel border border-line bg-surface p-8 shadow-panel lg:p-10">
        <p className="leading-none">
          <span className="block text-[1.5rem] font-extrabold tracking-[-0.03em] text-ink">
            {site.wordmark.primary}
          </span>{' '}
          <span className="mt-1 block text-[0.6rem] font-bold uppercase tracking-[0.34em] text-brass-deep">
            {site.wordmark.secondary}
          </span>
        </p>

        <h1 className="mt-7 text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink">
          Showroom admin
        </h1>
        <p className="mt-2 text-[0.9375rem]">
          Sign in to manage enquiries, products and site content.
        </p>

        <LoginForm from={from} />
      </div>
    </main>
  );
}
