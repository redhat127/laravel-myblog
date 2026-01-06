import { useFlashMessage } from '@/hooks/use-flash-message';
import { useUser } from '@/hooks/use-user';
import auth from '@/routes/auth';
import { Link, usePage } from '@inertiajs/react';
import { Key } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
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
  return (
    <>
      {!isAuthPage && !isErrorPage && (
        <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b p-4 px-8">
          <div></div>
          {user ? (
            <UserDropdown />
          ) : (
            <Button asChild variant={'outline'}>
              <Link href={auth.login.get()}>
                <Key />
                Login
              </Link>
            </Button>
          )}
        </header>
      )}
      <main>
        {children}
        <Toaster position="top-center" closeButton duration={8000} expand />
      </main>
    </>
  );
};
