import ResetPasswordController from '@/actions/App/Http/Controllers/ResetPasswordController';
import { showServerValidationError } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { SubmitBtn } from '../submit-btn';
import { TextInput } from '../text-input';
import { FieldGroup } from '../ui/field';

const resetPasswordSchema = z.object({
  email: z.email('valid email is required.').max(50, 'email is more than 50 characters.'),
});

export const ResetPasswordForm = () => {
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
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
        router.post(ResetPasswordController.post(), data, {
          preserveState: 'errors',
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
        <SubmitBtn disabled={isFormDisabled}>Reset Password</SubmitBtn>
      </FieldGroup>
    </form>
  );
};
