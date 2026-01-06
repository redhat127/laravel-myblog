import { UserInertiaSharedProps } from '@/types';
import { usePage } from '@inertiajs/react';

export const useUser = () => {
  return usePage<UserInertiaSharedProps>().props.user?.data;
};
