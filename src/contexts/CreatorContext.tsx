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
  // NEW: Creator list management
  creators: BBCreator[];
  creatorsLoading: boolean;
  creatorsError: string | null;
  refreshCreator: (id: string) => Promise<BBCreator | null>;
  refreshAllCreators: () => Promise<void>;
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
  
  // NEW: Creator list management
  const [creators, setCreators] = useState<BBCreator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState<boolean>(true);
  const [creatorsError, setCreatorsError] = useState<string | null>(null);

  // Load mock_mode from database on mount and fetch creators
  useEffect(() => {
    const init = async () => {
      await refreshMockModeFromDB();
      await refreshAllCreators();
    };
    init();
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
        const mockMode = data.data.mock_mode === true;
        console.log('mockMode initialized:', mockMode);
        setUsingMockDataState(mockMode);
        
        if (mockMode) {
          setBbApiStatus('MOCK_MODE');
        }
      }
    } catch (err) {
      console.error('Error loading mock_mode from database:', err);
    }
  };

  // Function to refresh all creators
  const refreshAllCreators = async () => {
    try {
      setCreatorsLoading(true);
      setCreatorsError(null);

      // Check mock_mode setting
      const { data: settingsData } = await supabase.functions.invoke('manage-api-settings', {
        method: 'GET',
      });
      
      const mockMode = settingsData?.data?.mock_mode === true;
      
      if (mockMode) {
        // Use mock data when mock_mode is explicitly true
        console.log('Mock mode enabled - loading mock creators');
        const { MOCK_CREATORS } = await import('@/mocks/mockCreators');
        const mockBBCreators: BBCreator[] = MOCK_CREATORS.map((mock) => ({
          creator_id: mock.id,
          name: mock.name,
          email: mock.email,
          profile_photo_url: mock.avatarUrl,
          creator_status: mock.status === 'completed' ? 'active' : 'pending',
        }));
        
        setCreators(mockBBCreators);
        setUsingMockDataState(true);
        setBbApiStatus('MOCK_MODE');
        return;
      }

      // Mock mode is off - fetch from BB API
      setUsingMockDataState(false);
      const { data, error } = await supabase.functions.invoke('fetch-creators-from-bb');

      if (error) {
        console.error('Error fetching creators from BB:', error);
        setCreatorsError('Failed to fetch creators from BB API');
        setBbApiStatus('CONNECTION_ERROR');
        setCreators([]);
        return;
      }

      if (!data?.success || !data?.data) {
        const errorMsg = data?.error || 'No creators returned from BB API';
        console.log('BB API error:', errorMsg);
        
        if (errorMsg.includes('not configured') || errorMsg.includes('API URL') || errorMsg.includes('API key')) {
          setBbApiStatus('MISSING_API_KEY');
          setCreatorsError('BB API is not configured');
        } else {
          setBbApiStatus('CONNECTION_ERROR');
          setCreatorsError('Failed to connect to BB API');
        }
        
        setCreators([]);
        return;
      }

      // Success - use real data
      setBbApiStatus('CONNECTED');
      setCreators(data.data);
      
      // Update selected creator if it's in the new list
      if (selectedCreator) {
        const updatedCreator = data.data.find((c: BBCreator) => c.creator_id === selectedCreator.creator_id);
        if (updatedCreator) {
          setSelectedCreatorState(updatedCreator);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching creators:', err);
      setCreatorsError('Unexpected error occurred');
      setBbApiStatus('CONNECTION_ERROR');
      setCreators([]);
    } finally {
      setCreatorsLoading(false);
    }
  };

  // Function to refresh a single creator
  const refreshCreator = async (id: string): Promise<BBCreator | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-creator-data', {
        body: { creator_id: id }
      });

      if (error || !data?.success || !data?.data) {
        console.error('Error refreshing creator:', error);
        return null;
      }

      const updatedCreator = data.data;
      
      // Update in the list
      setCreators(prev => prev.map(c => 
        c.creator_id === id ? updatedCreator : c
      ));
      
      // Update selected if it's the same creator
      if (selectedCreator?.creator_id === id) {
        setSelectedCreatorState(updatedCreator);
      }
      
      return updatedCreator;
    } catch (err) {
      console.error('Error refreshing creator:', err);
      return null;
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
      creators,
      creatorsLoading,
      creatorsError,
      refreshCreator,
      refreshAllCreators,
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
