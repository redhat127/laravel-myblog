import { cn } from '@/lib/utils';
import { home } from '@/routes';
import post from '@/routes/post';
import { Link } from '@inertiajs/react';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { HomeIcon, PanelLeftClose, PanelRightClose, PencilIcon } from 'lucide-react';
import { ReactNode, useLayoutEffect, useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent } from './ui/tooltip';

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);
  useLayoutEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      const { bottom } = header.getBoundingClientRect();
      setHeaderBottom(bottom);
    }
  }, []);
  if (headerBottom === 0) return null;
  return (
    <div
      className={cn('fixed left-0 z-50 flex h-screen flex-col items-center gap-6 border-r p-4 transition-all dark:bg-black', {
        'w-16': !open,
        'w-64': open,
      })}
      style={{
        top: `${headerBottom}px`,
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className={cn({
              'self-end': open,
            })}
            onClick={() => setOpen((prev) => !prev)}
          >
            {!open ? <PanelRightClose /> : <PanelLeftClose />}
          </Button>
        </TooltipTrigger>
        <TooltipContent align="center" side="right">
          {!open ? 'Open' : 'Close'}
        </TooltipContent>
      </Tooltip>
      <SidebarMenus sidebarOpen={open} />
    </div>
  );
};

const SidebarMenus = ({ sidebarOpen }: { sidebarOpen: boolean }) => {
  return sidebarOpen ? null : (
    <ul className="flex flex-col items-center justify-center gap-3">
      <li>
        <ClosedSidebarMenuItem href={home.url()} icon={<HomeIcon />} tooltipContent={'Home'} />
      </li>
      <li>
        <ClosedSidebarMenuItem href={post.create.url()} icon={<PencilIcon />} tooltipContent={'Create Post'} />
      </li>
    </ul>
  );
};

const ClosedSidebarMenuItem = ({ href, icon, tooltipContent }: { href: string; icon: ReactNode; tooltipContent: ReactNode }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="outline" size="icon-sm">
          <Link href={href}>{icon}</Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" align="center">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
};
