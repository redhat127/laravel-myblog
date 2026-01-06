import LoginController from '@/actions/App/Http/Controllers/LoginController';
import { showServerValidationError } from '@/lib/utils';
import resetPassword from '@/routes/auth/reset-password';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { CheckboxInput } from '../checkbox-input';
import { SubmitBtn } from '../submit-btn';
import { TextInput } from '../text-input';
import { Turnstile, useTurnstile } from '../turnstile-provider';
import { FieldGroup } from '../ui/field';

const loginSchema = z.object({
  email: z.email('valid email is required.').max(50, 'email is more than 50 characters.'),
  password: z.string().min(1, 'password is required.').max(50, 'password is more than 50 characters.'),
  remember_me: z.boolean('invalid input.'),
});

export const LoginForm = () => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
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
          LoginController.post(),
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
        <div className="space-y-1">
          <TextInput label="Password" control={control} name="password" inputProps={{ type: 'password' }} />
          <Link href={resetPassword.get()} className="inline-block text-sm underline underline-offset-4">
            Reset password?
          </Link>
        </div>
        <CheckboxInput label="Remember me?" control={control} name="remember_me" />
        <Turnstile />
        <SubmitBtn isLoading={isFormDisabled} disabled={isFormDisabled || !token}>
          Login
        </SubmitBtn>
      </FieldGroup>
    </form>
  );
};
