import { useFlashMessage } from '@/hooks/use-flash-message';
import { useUser } from '@/hooks/use-user';
import { clientEnv } from '@/lib/env';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import auth from '@/routes/auth';
import { Link, usePage } from '@inertiajs/react';
import { User } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { Sidebar } from '../sidebar';
import { Button } from '../ui/button';
import { Toaster } from '../ui/sonner';
import { UserDropdown } from '../user-dropdown';

const useIsAuthPage = () => {
  const { component } = usePage();
  return component.startsWith('auth/');
};

const useIsErrorPage = () => {
  const { component } = usePage();
  return component === 'error';
};

export const BaseLayout = ({ children }: { children: ReactNode }) => {
  const user = useUser();
  const isAuthPage = useIsAuthPage();
  const isErrorPage = useIsErrorPage();
  const flashMessage = useFlashMessage();
  useEffect(() => {
    if (flashMessage) {
      toast[flashMessage.type](flashMessage.text);
    }
  }, [flashMessage]);
  const [firstPart, ...rest] = clientEnv.VITE_APP_NAME.split(' ');
  const lastPart = rest.join(' ');
  return (
    <>
      {!isAuthPage && !isErrorPage && (
        <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b p-4 px-8 dark:bg-black">
          <Link href={home()} className="space-x-1 text-2xl font-bold">
            <span className="text-sky-400">{firstPart}</span>
            <span>{lastPart}</span>
          </Link>
          {user ? (
            <UserDropdown />
          ) : (
            <Button asChild variant={'outline'} size={'icon-sm'}>
              <Link href={auth.login.get()}>
                <User />
              </Link>
            </Button>
          )}
        </header>
      )}
      {user && <Sidebar />}
      <main
        className={cn({
          'mt-16 mb-8 ml-16 p-4 px-8': user,
        })}
      >
        {children}
        <Toaster position="top-center" closeButton duration={8000} expand />
      </main>
    </>
  );
};
