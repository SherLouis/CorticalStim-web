import React from 'react';
import { RootApplicationStore } from '../../core/application/stores/rootApplicationStore';

const store = new RootApplicationStore();
export const RootStoreContext = React.createContext(store);
export const RootStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>
);
