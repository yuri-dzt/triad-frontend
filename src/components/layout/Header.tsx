import React from 'react';
import { useLocation } from 'react-router-dom';
import { MenuIcon, ChevronRightIcon } from 'lucide-react';
interface HeaderProps {
  onMenuClick: () => void;
}
export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const formatPathName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  };
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
        
        <MenuIcon size={24} />
      </button>

      <div className="flex items-center text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Triad</span>
        {pathnames.length > 0 &&
        <>
            <ChevronRightIcon size={16} className="mx-2" />
            <span className="font-medium text-foreground">
              {formatPathName(pathnames[0])}
            </span>
          </>
        }
        {pathnames.length > 1 &&
        <>
            <ChevronRightIcon size={16} className="mx-2" />
            <span>{formatPathName(pathnames[1])}</span>
          </>
        }
      </div>
    </header>);

}