import LoginController from '@/actions/App/Http/Controllers/LoginController';
import { showServerValidationError } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { CheckboxInput } from '../checkbox-input';
import { SubmitBtn } from '../submit-btn';
import { TextInput } from '../text-input';
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
  const [isPending, setIsPending] = useState(false);
  const isFormDisabled = isSubmitting || isPending;
  return (
    <form
      onSubmit={handleSubmit((data) => {
        router.post(LoginController.post(), data, {
          onBefore() {
            setIsPending(true);
          },
          onFinish() {
            setIsPending(false);
          },
          onError(error) {
            showServerValidationError(error);
          },
        });
      })}
    >
      <FieldGroup className="gap-4">
        <TextInput label="Email" control={control} name="email" inputProps={{ type: 'email' }} />
        <TextInput label="Password" control={control} name="password" inputProps={{ type: 'password' }} />
        <CheckboxInput label="Remember me?" control={control} name="remember_me" />
        <SubmitBtn disabled={isFormDisabled}>Login</SubmitBtn>
      </FieldGroup>
    </form>
  );
};
