"use client";

import { createContext, useContext, useState } from "react";

type FocusCtx = { enabled: boolean; toggle: () => void };

const FocusContext = createContext<FocusCtx>({ enabled: false, toggle: () => {} });

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const toggle = () => setEnabled((v) => !v);
  return (
    <FocusContext.Provider value={{ enabled, toggle }}>
      {children}
    </FocusContext.Provider>
  );
}

export const useFocus = () => useContext(FocusContext);


