import React, { createContext, useContext, useState, ReactNode } from "react";

type AuthContextType = {
  isConnected: boolean;
  setIsConnected: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  isConnected: false,
  setIsConnected: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <AuthContext.Provider value={{ isConnected, setIsConnected }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
