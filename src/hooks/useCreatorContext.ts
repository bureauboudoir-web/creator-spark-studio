import { useState, useEffect } from 'react';
import { BBCreator } from '@/types/bb-creator';

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
}

export const useCreatorContext = (): CreatorContextValue => {
  const [selectedCreator, setSelectedCreatorState] = useState<BBCreator | null>(() => {
    try {
      const stored = localStorage.getItem('bb_selected_creator');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse stored creator data, clearing corrupted data:', error);
      localStorage.removeItem('bb_selected_creator');
      return null;
    }
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);
  const [bbApiStatus, setBbApiStatus] = useState<BBApiStatus>('UNKNOWN');

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

  return {
    selectedCreatorId: selectedCreator?.creator_id || null,
    selectedCreator,
    setSelectedCreator,
    apiError,
    setApiError,
    usingMockData,
    setUsingMockData,
    bbApiStatus,
    setBbApiStatus,
  };
};
