import { useState, useEffect } from 'react';
import { BBCreator } from '@/types/bb-creator';

interface CreatorContextValue {
  selectedCreatorId: string | null;
  selectedCreator: BBCreator | null;
  setSelectedCreator: (creator: BBCreator | null) => void;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  usingMockData: boolean;
  setUsingMockData: (value: boolean) => void;
}

export const useCreatorContext = (): CreatorContextValue => {
  const [selectedCreator, setSelectedCreatorState] = useState<BBCreator | null>(() => {
    const stored = localStorage.getItem('bb_selected_creator');
    return stored ? JSON.parse(stored) : null;
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

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
  };
};
