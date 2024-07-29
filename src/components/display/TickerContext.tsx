import { createContext, useState, ReactNode, useRef } from 'react';
import { useToast } from '../ui/use-toast';
import { useMutation } from '@tanstack/react-query';

type TickerResponse = {
  addFirm: () => void;
  firmName: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  ticker: string | null;
};

export const TickerContext = createContext<TickerResponse>({
  addFirm: () => {},
  firmName: '',
  handleInputChange: () => {},
  isLoading: false,
  ticker: null,
});

interface Props {
  children: ReactNode;
}

export const TickerContextProvider = ({ children }: Props) => {
  const [firmName, setFirmName] = useState<string>('');
  const [ticker, setTicker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const backupFirmName = useRef<string>('');

  const { mutate: getTicker } = useMutation({
    mutationFn: async ({ firmName }: { firmName: string }) => {
      const response = await fetch('/api/ticker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firmName }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticker');
      }

      return response.json();
    },
    onMutate: async ({ firmName }) => {
      backupFirmName.current = firmName;
      setFirmName('');
      setTicker(null);
      setIsLoading(true);
    },
    onSuccess: (data) => {
      setIsLoading(false);
      setTicker(data.ticker);
    },
    onError: () => {
      setFirmName(backupFirmName.current);
      toast({
        title: 'Error',
        description: 'Failed to fetch ticker. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirmName(e.target.value);
  };

  const addFirm = () => getTicker({ firmName });

  return (
    <TickerContext.Provider
      value={{
        addFirm,
        firmName,
        handleInputChange,
        isLoading,
        ticker,
      }}
    >
      {children}
    </TickerContext.Provider>
  );
};
