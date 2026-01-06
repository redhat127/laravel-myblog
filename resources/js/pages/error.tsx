import { BaseLayout } from '@/components/layout/base-layout';
import { CenteredLayout } from '@/components/layout/centered-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pageTitle } from '@/lib/utils';
import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function ErrorPage({ statusCode, title, message }: { statusCode: number; title: string; message: string }) {
  return (
    <>
      <Head>
        <title>{pageTitle(title)}</title>
      </Head>
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>
            <h1 className="font-bold dark:text-red-400">
              {statusCode} - {title}
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message}
          <div className="mt-2">
            <Link href={home()} className="text-sm underline underline-offset-4">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

ErrorPage.layout = (page: ReactNode) => (
  <BaseLayout>
    <CenteredLayout>{page}</CenteredLayout>
  </BaseLayout>
);
