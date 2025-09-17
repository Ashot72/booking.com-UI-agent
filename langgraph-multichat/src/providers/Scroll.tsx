"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ScrollContextType = {
    shouldScroll: boolean;
    setShouldScroll: React.Dispatch<React.SetStateAction<boolean>>;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
    const [shouldScroll, setShouldScroll] = useState(false);

    return (
        <ScrollContext.Provider value={{ shouldScroll, setShouldScroll }}>
            {children}
        </ScrollContext.Provider>
    );
};

export const useScroll = () => {
    const context = useContext(ScrollContext);
    if (!context) {
        throw new Error("useScroll must be used within a ScrollProvider");
    }
    return context;
};