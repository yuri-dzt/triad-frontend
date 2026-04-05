import React, { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangleIcon, XIcon } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { message: '' },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ isOpen: true, options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState(prev => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState(prev => ({ ...prev, isOpen: false, resolve: null }));
  };

  const isDanger = state.options.variant === 'danger';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={handleCancel}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="relative bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isDanger ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                  <AlertTriangleIcon size={20} className={isDanger ? 'text-destructive' : 'text-primary'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground">
                    {state.options.title || 'Confirmar ação'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {state.options.message}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {state.options.cancelLabel || 'Cancelar'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isDanger
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {state.options.confirmLabel || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
