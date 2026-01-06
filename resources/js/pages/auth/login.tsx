import { LoginForm } from '@/components/form/login-form';
import { BaseLayout } from '@/components/layout/base-layout';
import { CenteredLayout } from '@/components/layout/centered-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pageTitle } from '@/lib/utils';
import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

export default function Login() {
  return (
    <>
      <Head>
        <title>{pageTitle('Login')}</title>
      </Head>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="font-bold">Login</h1>
          </CardTitle>
          <CardDescription>Use your email and password to login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <Button asChild variant="outline" className="w-full">
            <Link href={home()}>
              <ArrowRight />
              Back to home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

Login.layout = (page: ReactNode) => (
  <BaseLayout>
    <CenteredLayout>{page}</CenteredLayout>
  </BaseLayout>
);
