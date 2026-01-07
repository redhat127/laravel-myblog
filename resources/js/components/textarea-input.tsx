import { useId, type ComponentProps } from 'react';
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from './ui/field';
import { Textarea } from './ui/textarea';

export const TextareaInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  textareaProps = {},
}: Pick<ControllerProps<TFieldValues, TName, TTransformedValues>, 'control' | 'name'> & {
  label: string;
  textareaProps?: ComponentProps<'textarea'>;
}) => {
  const id = `${name}-${useId()}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Textarea {...textareaProps} {...field} id={id} aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
