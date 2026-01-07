import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useId } from 'react';
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Field, FieldError, FieldLabel } from './ui/field';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export const DatePickerInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  placeholder = 'Pick a date',
  disabledDates,
}: Pick<ControllerProps<TFieldValues, TName, TTransformedValues>, 'control' | 'name'> & {
  label: string;
  placeholder?: string;
  disabledDates?: (date: Date) => boolean;
}) => {
  const id = `${name}-${useId()}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={id}
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                aria-invalid={fieldState.invalid}
              >
                <CalendarIcon className="h-4 w-4" />
                {field.value ? format(field.value, 'PPP') : <span>{placeholder}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={disabledDates} initialFocus />
            </PopoverContent>
          </Popover>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
