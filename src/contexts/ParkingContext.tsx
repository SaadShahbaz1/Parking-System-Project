import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  ParkingSystem, 
  getParkingSystem, 
  Zone, 
  ParkingRequest, 
  SystemAnalytics,
  calculateCharges 
} from '@/lib/parking-system';

interface ParkingContextType {
  zones: Zone[];
  activeRequests: ParkingRequest[];
  historyRequests: ParkingRequest[];
  analytics: SystemAnalytics;
  allocateSlot: (zoneId: string, licensePlate: string, duration: number) => ParkingRequest | null;
  releaseSlot: (requestId: string) => boolean;
  cancelRequest: (requestId: string) => boolean;
  calculatePrice: (duration: number) => { hourlyRate: number; baseFee: number; total: number };
  refreshData: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const system = getParkingSystem();
  
  const [zones, setZones] = useState<Zone[]>(system.getZones());
  const [activeRequests, setActiveRequests] = useState<ParkingRequest[]>(system.getActiveRequests());
  const [historyRequests, setHistoryRequests] = useState<ParkingRequest[]>(system.getHistoryRequests());
  const [analytics, setAnalytics] = useState<SystemAnalytics>(system.getAnalytics());
  
  const refreshData = useCallback(() => {
    setZones([...system.getZones()]);
    setActiveRequests([...system.getActiveRequests()]);
    setHistoryRequests([...system.getHistoryRequests()]);
    setAnalytics(system.getAnalytics());
  }, [system]);
  
  const allocateSlot = useCallback((zoneId: string, licensePlate: string, duration: number) => {
    const result = system.allocateSlot(zoneId, licensePlate, duration);
    if (result) {
      refreshData();
    }
    return result;
  }, [system, refreshData]);
  
  const releaseSlot = useCallback((requestId: string) => {
    const result = system.releaseSlot(requestId);
    if (result) {
      refreshData();
    }
    return result;
  }, [system, refreshData]);
  
  const cancelRequest = useCallback((requestId: string) => {
    const result = system.cancelRequest(requestId);
    if (result) {
      refreshData();
    }
    return result;
  }, [system, refreshData]);
  
  const calculatePrice = useCallback((duration: number) => {
    return calculateCharges(duration);
  }, []);
  
  return (
    <ParkingContext.Provider
      value={{
        zones,
        activeRequests,
        historyRequests,
        analytics,
        allocateSlot,
        releaseSlot,
        cancelRequest,
        calculatePrice,
        refreshData,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
}
