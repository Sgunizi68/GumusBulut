
import { createContext, useContext } from 'react';
import { AppContextType, DataContextType } from './types';

// App Context
export const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

// Data Context for shared lists
export const DataContext = createContext<DataContextType | null>(null);
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within a DataProvider');
  return context;
};
