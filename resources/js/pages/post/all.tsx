import { BaseLayout } from '@/components/layout/base-layout';
import { pageTitle } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function AllPost() {
  return (
    <Head>
      <title>{pageTitle('All Post')}</title>
    </Head>
  );
}

AllPost.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
