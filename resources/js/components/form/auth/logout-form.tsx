import LogoutController from '@/actions/App/Http/Controllers/LogoutController';
import { router } from '@inertiajs/react';
import { LogOutIcon } from 'lucide-react';
import { useState } from 'react';

export const LogoutForm = () => {
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        router.post(LogoutController.post(), undefined, {
          onBefore() {
            setIsFormDisabled(true);
          },
          onFinish() {
            setIsFormDisabled(false);
          },
        });
      }}
    >
      <button type="submit" disabled={isFormDisabled} className="flex w-full items-center gap-1.5 px-2 py-1.5 dark:text-red-400">
        <LogOutIcon className="text-inherit" />
        Logout
      </button>
    </form>
  );
};
