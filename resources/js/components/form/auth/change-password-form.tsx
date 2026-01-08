import ChangePasswordController from '@/actions/App/Http/Controllers/ChangePasswordController';
import { SubmitBtn } from '@/components/submit-btn';
import { TextInput } from '@/components/text-input';
import { FieldGroup } from '@/components/ui/field';
import { showServerValidationError } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Turnstile, useTurnstile } from '../../turnstile-provider';

const changePasswordSchema = z.object({
  email: z.email('valid email is required.').max(50, 'email is more than 50 characters.'),
  token: z.string().min(1, 'token is required.').max(50, 'token is more than 50 characters.'),
  newPassword: z.string().min(10, 'minimum for password is 10 characters.').max(50, 'password is more than 50 characters.'),
});

export const ChangePasswordForm = () => {
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      email: '',
      token: '',
      newPassword: '',
    },
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const { token, reset } = useTurnstile();
  const [isPending, setIsPending] = useState(false);
  const isFormDisabled = isSubmitting || isPending;
  return (
    <form
      onSubmit={handleSubmit((data) => {
        router.post(
          ChangePasswordController.post(),
          {
            ...data,
            'cf-turnstile-response': token,
          },
          {
            onBefore() {
              if (!token) return false;
              setIsPending(true);
            },
            onFinish() {
              setIsPending(false);
              reset();
            },
            onError(error) {
              showServerValidationError(error);
            },
          },
        );
      })}
    >
      <FieldGroup className="gap-4">
        <TextInput label="Email" control={control} name="email" inputProps={{ type: 'email' }} />
        <TextInput label="Token" control={control} name="token" />
        <TextInput label="New Password" control={control} name="newPassword" inputProps={{ type: 'password' }} />
        <Turnstile />
        <SubmitBtn isLoading={isFormDisabled} disabled={isFormDisabled || !token}>
          Change Password
        </SubmitBtn>
      </FieldGroup>
    </form>
  );
};
