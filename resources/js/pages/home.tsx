import { BaseLayout } from '@/components/layout/base-layout';
import { pageTitle } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function Home() {
  return (
    <Head>
      <title>{pageTitle('A Glimpse into My World')}</title>
    </Head>
  );
}

Home.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
