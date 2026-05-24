import {useState, useCallback, useRef} from 'react';

export type ToastType = 'info' | 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<Toast>({
    message: '',
    type: 'info',
    visible: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({message, type, visible: true});
    timerRef.current = setTimeout(() => {
      setToast(prev => ({...prev, visible: false}));
    }, 3000);
  }, []);

  return {toast, showToast};
}
