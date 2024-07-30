"use client";

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface LoadingContextProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  disableAfterLoading: boolean;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [disableAfterLoading, setDisableAfterLoading] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!loading && disableAfterLoading) {
      timer = setTimeout(() => {
        setDisableAfterLoading(false);
      }, 20000); // 20 seconds timeout
    }
    return () => clearTimeout(timer);
  }, [loading, disableAfterLoading]);

  const handleSetLoading = (isLoading: boolean) => {
    setLoading(isLoading);
    if (isLoading) {
      setDisableAfterLoading(true);
    }
  };

  return (
    <LoadingContext.Provider value={{ loading, setLoading: handleSetLoading, disableAfterLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
