import { FlashMessageInertiaSharedProps } from '@/types';
import { usePage } from '@inertiajs/react';

export const useFlashMessage = () => {
  return usePage<FlashMessageInertiaSharedProps>().props.flashMessage;
};
