import { ReactNode } from 'react';

export const CenteredLayout = ({ children }: { children: ReactNode }) => {
  return <div className="flex min-h-screen items-center justify-center p-4 px-8">{children}</div>;
};
