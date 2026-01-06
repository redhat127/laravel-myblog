import { clientEnv } from '@/lib/env';
import { appInProduction } from '@/lib/utils';
import { Turnstile as ReactTurnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { createContext, ReactNode, RefObject, use, useRef, useState } from 'react';
import { toast } from 'sonner';

interface TurnstileCtx {
  token: string | null;
  setToken(token: string | null): void;
  ref?: RefObject<TurnstileInstance | undefined>;
  reset(): void;
}

const TurnstileCtx = createContext<TurnstileCtx>({ token: null, setToken() {}, reset() {} });

export const useTurnstile = () => {
  return use(TurnstileCtx);
};

const isAppInProduction = appInProduction();

export const TurnstileProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TurnstileCtx['token']>(() => {
    return !isAppInProduction ? 'not-production' : null;
  });
  const ref = useRef<TurnstileInstance>(undefined);
  const setToken: TurnstileCtx['setToken'] = (token) => {
    setState(token);
  };
  return (
    <TurnstileCtx
      value={{
        token: state,
        setToken,
        ref: !isAppInProduction ? undefined : ref,
        reset() {
          if (!isAppInProduction) return;
          setToken(null);
          if (ref.current) {
            ref.current.reset();
          }
        },
      }}
    >
      {children}
    </TurnstileCtx>
  );
};

export const Turnstile = () => {
  const { setToken, ref } = useTurnstile();
  return !isAppInProduction ? null : (
    <ReactTurnstile
      ref={ref}
      siteKey={clientEnv.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
      onSuccess={(secret) => {
        setToken(secret);
      }}
      onError={() => {
        setToken(null);
        toast.error('Turnstile verification failed. try again.');
      }}
      onExpire={() => {
        setToken(null);
        toast.warning('Verification expired. solving the challenge again.');
      }}
    />
  );
};
