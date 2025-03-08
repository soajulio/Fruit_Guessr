import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ServerIpContextProps {
  serverIp: string;
  setServerIp: (ip: string) => void;
}

const ServerIpContext = createContext<ServerIpContextProps | undefined>(undefined);

export const ServerIpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverIp, setServerIp] = useState<string>("");

  useEffect(() => {
    const loadServerIp = async () => {
      try {
        const savedIP = await AsyncStorage.getItem("server_ip");
        if (savedIP) {
          setServerIp(savedIP || "");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'IP :", error);
      }
    };
    loadServerIp();
  }, []);

  const updateServerIp = async (ip: string) => {
    try {
      await AsyncStorage.setItem("server_ip", ip);
      setServerIp(ip);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'IP :", error);
    }
  };

  return (
    <ServerIpContext.Provider value={{ serverIp, setServerIp: updateServerIp }}>
      {children}
    </ServerIpContext.Provider>
  );
};

export const useServerIp = () => {
  const context = useContext(ServerIpContext);
  if (!context) {
    throw new Error("useServerIp doit être utilisé dans un ServerIpProvider");
  }
  return context;
};