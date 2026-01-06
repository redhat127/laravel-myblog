import type { ComponentProps } from 'react';
import { Button } from './ui/button';
import { LoadingSwap } from './ui/loading-swap';

export const SubmitBtn = ({ isLoading, ...props }: ComponentProps<typeof Button> & { isLoading: boolean }) => {
  return (
    <Button {...props} type="submit">
      <LoadingSwap isLoading={isLoading}>{props.children}</LoadingSwap>
    </Button>
  );
};
