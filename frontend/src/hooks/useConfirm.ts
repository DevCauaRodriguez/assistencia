import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning'
  });

  const showConfirm = useCallback((
    options: ConfirmOptions,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setConfirmState({
      ...options,
      isOpen: true,
      onConfirm,
      onCancel
    });
  }, []);

  const confirm = useCallback((
    title: string,
    message: string,
    type: 'danger' | 'warning' | 'success' | 'info' = 'warning'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      showConfirm(
        { title, message, type },
        () => resolve(true),
        () => resolve(false)
      );
    });
  }, [showConfirm]);

  const handleConfirm = useCallback(() => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm();
    }
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, [confirmState.onConfirm]);

  const handleCancel = useCallback(() => {
    if (confirmState.onCancel) {
      confirmState.onCancel();
    }
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, [confirmState.onCancel]);

  return {
    confirmState,
    showConfirm,
    confirm,
    handleConfirm,
    handleCancel
  };
};