import { useState, useEffect } from 'react';

export const useCreatorContext = () => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(() => {
    return localStorage.getItem('bb_selected_creator');
  });

  useEffect(() => {
    if (selectedCreatorId) {
      localStorage.setItem('bb_selected_creator', selectedCreatorId);
    } else {
      localStorage.removeItem('bb_selected_creator');
    }
  }, [selectedCreatorId]);

  return { selectedCreatorId, setSelectedCreatorId };
};
