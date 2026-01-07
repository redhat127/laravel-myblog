import { useId } from 'react';
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from './ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const SelectInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  options,
  placeholder = 'Select an option',
}: Pick<ControllerProps<TFieldValues, TName, TTransformedValues>, 'control' | 'name'> & {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) => {
  const id = `${name}-${useId()}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select name={field.name} disabled={field.disabled} onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger onBlur={field.onBlur} ref={field.ref} id={id} aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
