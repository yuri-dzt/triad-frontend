import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboardIcon,
  DumbbellIcon,
  UtensilsIcon,
  TargetIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XIcon,
  CalendarIcon,
  ListIcon,
  ClipboardListIcon,
  HistoryIcon,
  UtensilsCrossedIcon,
  GoalIcon,
  CheckSquareIcon,
  BookOpenIcon,
  BarChart3Icon } from
'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  children?: {name: string;path: string;}[];
}

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  // Auto-expand the parent section matching the current route
  const getActiveParents = () => {
    const active: string[] = [];
    if (location.pathname.startsWith('/treino')) active.push('/treino');
    if (location.pathname.startsWith('/dieta')) active.push('/dieta');
    if (location.pathname.startsWith('/disciplina')) active.push('/disciplina');
    return active;
  };
  const [expandedItems, setExpandedItems] = useState<string[]>(getActiveParents);

  const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboardIcon
  },
  {
    name: 'Treino',
    path: '/treino',
    icon: DumbbellIcon,
    children: [
    { name: 'Planos', path: '/treino/planos' },
    { name: 'Exercícios', path: '/treino/exercicios' },
    { name: 'Agenda', path: '/treino/agenda' },
    { name: 'Histórico', path: '/treino/historico' }]

  },
  {
    name: 'Dieta',
    path: '/dieta',
    icon: UtensilsIcon,
    children: [
    { name: 'Hoje', path: '/dieta/hoje' },
    { name: 'Metas', path: '/dieta/metas' },
    { name: 'Histórico', path: '/dieta/historico' }]

  },
  {
    name: 'Disciplina',
    path: '/disciplina',
    icon: TargetIcon,
    children: [
    { name: 'Hoje', path: '/disciplina/hoje' },
    { name: 'Hábitos', path: '/disciplina/habitos' },
    { name: 'Livros', path: '/disciplina/livros' },
    { name: 'Estatísticas', path: '/disciplina/stats' }]

  }];


  const bottomItems = [
  {
    name: 'Configurações',
    path: '/config',
    icon: SettingsIcon
  }];


  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
    prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) =>
      location.pathname.startsWith(child.path)
      );
    }
    return location.pathname === item.path;
  };

  const showLabels = !isCollapsed || isMobileOpen;

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const isActive = isParentActive(item);

    if (hasChildren) {
      return (
        <div key={item.path}>
          <button
            onClick={() => {
              if (isCollapsed && !isMobileOpen) {
                // When collapsed, navigate to first child
                return;
              }
              toggleExpanded(item.path);
            }}
            className={cn(
              'w-full flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive ?
              'bg-primary/10 text-primary' :
              'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}>
            
            <item.icon size={20} className={cn('shrink-0', showLabels && 'mr-3')} />
            {showLabels &&
            <>
                <span className="flex-1 text-left">{item.name}</span>
                <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}>
                
                  <ChevronDownIcon size={14} className="opacity-50" />
                </motion.div>
              </>
            }
          </button>

          <AnimatePresence>
            {isExpanded && showLabels &&
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden">
              
                <div className="ml-5 pl-3 border-l border-border space-y-0.5 mt-0.5 mb-1">
                  {item.children!.map((child) =>
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={() => isMobileOpen && setIsMobileOpen(false)}
                  className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive ?
                    'text-primary font-medium' :
                    'text-muted-foreground hover:text-foreground'
                  )
                  }>
                  
                      {child.name}
                    </NavLink>
                )}
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>);

    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end
        onClick={() => isMobileOpen && setIsMobileOpen(false)}
        className={({ isActive }) =>
        cn(
          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive ?
          'bg-primary/10 text-primary' :
          'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )
        }>
        
        <item.icon size={20} className={cn('shrink-0', showLabels && 'mr-3')} />
        {showLabels && <span>{item.name}</span>}
      </NavLink>);

  };

  const sidebarContent =
  <div className="flex h-full flex-col bg-card border-r border-border text-card-foreground">
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {showLabels &&
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-bold tracking-widest text-foreground">
        
            TRIAD
          </motion.span>
      }
        {isCollapsed && !isMobileOpen &&
      <span className="mx-auto text-lg font-bold text-primary">T</span>
      }

        {/* Desktop Collapse Toggle */}
        <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
        
          {isCollapsed ?
        <ChevronRightIcon size={18} /> :

        <ChevronLeftIcon size={18} />
        }
        </button>

        {/* Mobile Close Toggle */}
        <button
        onClick={() => setIsMobileOpen(false)}
        className="md:hidden p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
        
          <XIcon size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map(renderNavItem)}
        </nav>
      </div>

      <div className="p-4 border-t border-border space-y-1">
        {bottomItems.map((item) =>
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => isMobileOpen && setIsMobileOpen(false)}
        className={({ isActive }) =>
        cn(
          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive ?
          'bg-primary/10 text-primary' :
          'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )
        }>
        
            <item.icon size={20} className={cn('shrink-0', showLabels && 'mr-3')} />
            {showLabels && <span>{item.name}</span>}
          </NavLink>
      )}
        <button
        onClick={logout}
        className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
        
          <LogOutIcon size={20} className={cn('shrink-0', showLabels && 'mr-3')} />
          {showLabels && <span>Sair</span>}
        </button>
      </div>
    </div>;


  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        className="hidden md:block h-screen sticky top-0 z-20">
        
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen &&
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
        onClick={() => setIsMobileOpen(false)} />

      }

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
        
        {sidebarContent}
      </motion.aside>
    </>);

}