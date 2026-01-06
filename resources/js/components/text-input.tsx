import { useId, type ComponentProps } from 'react';
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { PasswordInput } from './ui/password-input';

export const TextInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  inputProps = {},
}: Pick<ControllerProps<TFieldValues, TName, TTransformedValues>, 'control' | 'name'> & {
  label: string;
  inputProps?: ComponentProps<'input'>;
}) => {
  const { type = 'text', autoComplete = 'on', ...rest } = inputProps;
  const isPassword = type === 'password';
  const InputComponent = isPassword ? PasswordInput : Input;
  const id = `${name}-${useId()}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <InputComponent {...rest} {...field} id={id} autoComplete={autoComplete} aria-invalid={fieldState.invalid} {...(!isPassword && { type })} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
