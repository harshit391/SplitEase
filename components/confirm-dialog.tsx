"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (title: string, description?: string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
  alert: () => Promise.resolve(),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({ open: false, options: { title: "" }, resolve: null });

  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    resolve: (() => void) | null;
  }>({ open: false, title: "", resolve: null });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const alertFn = useCallback((title: string, description?: string): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({ open: true, title, description, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ open: false, options: { title: "" }, resolve: null });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ open: false, options: { title: "" }, resolve: null });
  };

  const handleAlertClose = () => {
    alertState.resolve?.();
    setAlertState({ open: false, title: "", resolve: null });
  };

  return (
    <ConfirmContext.Provider value={{ confirm, alert: alertFn }}>
      {children}

      {/* Confirm Dialog */}
      <Dialog open={state.open} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{state.options.title}</DialogTitle>
            {state.options.description && (
              <DialogDescription>{state.options.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {state.options.cancelText || "Cancel"}
            </Button>
            <Button
              variant={state.options.variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
            >
              {state.options.confirmText || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertState.open} onOpenChange={(open) => !open && handleAlertClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{alertState.title}</DialogTitle>
            {alertState.description && (
              <DialogDescription>{alertState.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleAlertClose}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
