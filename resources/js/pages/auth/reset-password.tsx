import { ResetPasswordForm } from '@/components/form/reset-password-form';
import { BaseLayout } from '@/components/layout/base-layout';
import { CenteredLayout } from '@/components/layout/centered-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pageTitle } from '@/lib/utils';
import { home } from '@/routes';
import login from '@/routes/auth/login';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

export default function ResetPassword() {
  return (
    <>
      <Head>
        <title>{pageTitle('Reset Password')}</title>
      </Head>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="font-bold">Reset Password</h1>
          </CardTitle>
          <CardDescription>Enter your email address and we will send you a token to reset your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResetPasswordForm />
          <Link href={login.get()} className="inline-block text-sm underline underline-offset-4">
            Back to login
          </Link>
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

ResetPassword.layout = (page: ReactNode) => (
  <BaseLayout>
    <CenteredLayout>{page}</CenteredLayout>
  </BaseLayout>
);
