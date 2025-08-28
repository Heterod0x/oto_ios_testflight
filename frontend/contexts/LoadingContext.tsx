import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

interface ActionButton {
  text: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  actionButton?: ActionButton;
  showLoading: (message?: string, actionButton?: ActionButton) => void;
  hideLoading: () => void;
  onActionClick?: () => void;
  setActionClickHandler: (handler: () => void) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [actionButton, setActionButton] = useState<ActionButton | undefined>();
  const [onActionClick, setOnActionClick] = useState<(() => void) | undefined>(
    undefined
  );

  const showLoading = useCallback(
    (message: string = 'Loading...', actionBtn?: ActionButton) => {
      setLoadingMessage(message);
      setActionButton(actionBtn);
      setIsLoading(true);
    },
    []
  );

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setActionButton(undefined);
    setOnActionClick(undefined);
  }, []);

  const setActionClickHandler = useCallback((handler: () => void) => {
    setOnActionClick(() => handler);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        actionButton,
        showLoading,
        hideLoading,
        onActionClick,
        setActionClickHandler,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
