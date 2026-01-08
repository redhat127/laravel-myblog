import { cn } from '@/lib/utils';
import { home } from '@/routes';
import post from '@/routes/post';
import { Link } from '@inertiajs/react';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { ChevronDownIcon, ChevronRightIcon, HomeIcon, PanelLeftClose, PanelRightClose, PencilIcon } from 'lucide-react';
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent } from './ui/tooltip';

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  children?: Array<{ label: string; href: string }>;
  collapsedHref?: string; // Different href when sidebar is collapsed
  collapsedLabel?: string; // Different label when sidebar is collapsed
}

interface ExpandedMenuItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  isCollapsible?: boolean;
  submenu?: ReactNode;
}

interface CollapsedMenuItemProps {
  href: string;
  icon: ReactNode;
  label: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeIcon />,
    href: home.url(),
  },
  {
    id: 'post',
    label: 'Post',
    icon: <PencilIcon />,
    href: post.all.url(),
    collapsedHref: post.create.url(),
    collapsedLabel: 'Create Post',
    children: [
      { label: 'All Post', href: post.all.url() },
      { label: 'Create Post', href: post.create.url() },
    ],
  },
];

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);
  const sidebarRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const updateHeaderPosition = () => {
      const header = document.querySelector('header');
      if (header) {
        const { bottom } = header.getBoundingClientRect();
        setHeaderBottom(bottom);
      }
    };

    updateHeaderPosition();
    window.addEventListener('resize', updateHeaderPosition);

    return () => window.removeEventListener('resize', updateHeaderPosition);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  if (headerBottom === 0) return null;

  return (
    <aside
      ref={sidebarRef}
      className={cn('fixed left-0 z-50 flex flex-col items-center gap-6 border-r p-4 transition-all dark:bg-black', isExpanded ? 'w-64' : 'w-16')}
      style={{
        top: `${headerBottom}px`,
        height: `calc(100dvh - ${headerBottom}px)`, // dvh = dynamic viewport height (better for mobile)
      }}
      aria-label="Main navigation"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className={cn(isExpanded && 'self-end')}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <PanelLeftClose /> : <PanelRightClose />}
          </Button>
        </TooltipTrigger>
        <TooltipContent align="center" side="right">
          {isExpanded ? 'Close' : 'Open'}
        </TooltipContent>
      </Tooltip>
      <Navigation isExpanded={isExpanded} />
    </aside>
  );
};

const Submenu = ({ items }: { items: Array<{ label: string; href: string }> }) => {
  return (
    <ul className="mx-4 my-1 border-l pl-2 text-sm dark:border-zinc-800 dark:text-muted-foreground">
      {items.map((item) => (
        <li key={item.href}>
          <Button asChild variant="ghost" className="w-full justify-start py-0">
            <Link href={item.href}>{item.label}</Link>
          </Button>
        </li>
      ))}
    </ul>
  );
};

const Navigation = ({ isExpanded }: { isExpanded: boolean }) => {
  if (!isExpanded) {
    return (
      <nav aria-label="Collapsed navigation" className="scrollbar-hide flex-1 overflow-y-auto">
        <ul className="flex flex-col items-center justify-center gap-3">
          {MENU_ITEMS.map((item) => (
            <CollapsedMenuItem key={item.id} href={item.collapsedHref || item.href} icon={item.icon} label={item.collapsedLabel || item.label} />
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="scrollbar-hide w-full flex-1 overflow-y-auto" aria-label="Expanded navigation">
      <ul>
        {MENU_ITEMS.map((item) => (
          <ExpandedMenuItem
            key={item.id}
            icon={item.icon}
            href={item.href}
            isCollapsible={!!item.children}
            submenu={item.children ? <Submenu items={item.children} /> : undefined}
          >
            {item.label}
          </ExpandedMenuItem>
        ))}
      </ul>
    </nav>
  );
};

const ExpandedMenuItem = ({ href, children, icon, isCollapsible = false, submenu }: ExpandedMenuItemProps) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const toggleSubmenu = () => {
    if (isCollapsible) {
      setIsSubmenuOpen((prev) => !prev);
    }
  };

  const renderButtonContent = () => {
    if (isCollapsible) {
      return (
        <>
          {icon}
          {children}
          {isSubmenuOpen ? <ChevronDownIcon className="ml-auto" /> : <ChevronRightIcon className="ml-auto" />}
        </>
      );
    }

    return (
      <Link href={href}>
        {icon}
        {children}
      </Link>
    );
  };

  return (
    <li>
      <Button
        asChild={!isCollapsible}
        variant="ghost"
        className="w-full justify-start"
        onClick={toggleSubmenu}
        aria-expanded={isCollapsible ? isSubmenuOpen : undefined}
      >
        {renderButtonContent()}
      </Button>
      {isSubmenuOpen && submenu}
    </li>
  );
};

const CollapsedMenuItem = ({ href, icon, label }: CollapsedMenuItemProps) => {
  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="outline" size="icon-sm">
            <Link href={href}>{icon}</Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          {label}
        </TooltipContent>
      </Tooltip>
    </li>
  );
};
