import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BBCreator } from '@/types/bb-creator';
import { supabase } from '@/integrations/supabase/client';

export type BBApiStatus = 'CONNECTED' | 'MISSING_API_URL' | 'MISSING_API_KEY' | 'CONNECTION_ERROR' | 'MOCK_MODE' | 'UNKNOWN';

interface CreatorContextValue {
  selectedCreatorId: string | null;
  selectedCreator: BBCreator | null;
  setSelectedCreator: (creator: BBCreator | null) => void;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  usingMockData: boolean;
  setUsingMockData: (value: boolean) => void;
  bbApiStatus: BBApiStatus;
  setBbApiStatus: (status: BBApiStatus) => void;
  refreshMockModeFromDB: () => Promise<void>;
}

const CreatorContext = createContext<CreatorContextValue | undefined>(undefined);

export const CreatorProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCreator, setSelectedCreatorState] = useState<BBCreator | null>(() => {
    try {
      const stored = localStorage.getItem('bb_selected_creator');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse stored creator data:', error);
      localStorage.removeItem('bb_selected_creator');
      return null;
    }
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [usingMockData, setUsingMockDataState] = useState<boolean>(false);
  const [bbApiStatus, setBbApiStatus] = useState<BBApiStatus>('UNKNOWN');

  // Load mock_mode from database on mount
  useEffect(() => {
    refreshMockModeFromDB();
  }, []);

  // Persist selected creator to localStorage
  useEffect(() => {
    if (selectedCreator) {
      localStorage.setItem('bb_selected_creator', JSON.stringify(selectedCreator));
    } else {
      localStorage.removeItem('bb_selected_creator');
    }
  }, [selectedCreator]);

  const setSelectedCreator = (creator: BBCreator | null) => {
    setSelectedCreatorState(creator);
    setApiError(null);
  };

  const setUsingMockData = (value: boolean) => {
    console.log('Global mockMode updated:', value);
    setUsingMockDataState(value);
  };

  // Function to refresh mock_mode from database
  const refreshMockModeFromDB = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-settings', {
        method: 'GET',
      });
      
      if (!error && data?.data) {
        const mockMode = data.data.mock_mode ?? true;
        console.log('Global mockMode updated:', mockMode);
        setUsingMockDataState(mockMode);
        
        if (mockMode) {
          setBbApiStatus('MOCK_MODE');
        }
      }
    } catch (err) {
      console.error('Error loading mock_mode from database:', err);
    }
  };

  return (
    <CreatorContext.Provider value={{
      selectedCreatorId: selectedCreator?.creator_id || null,
      selectedCreator,
      setSelectedCreator,
      apiError,
      setApiError,
      usingMockData,
      setUsingMockData,
      bbApiStatus,
      setBbApiStatus,
      refreshMockModeFromDB,
    }}>
      {children}
    </CreatorContext.Provider>
  );
};

export const useCreatorContext = (): CreatorContextValue => {
  const context = useContext(CreatorContext);
  if (context === undefined) {
    throw new Error('useCreatorContext must be used within a CreatorProvider');
  }
  return context;
};
