// Smart Parking Zone Management System - Core Logic

export type RequestStatus = 'REQUESTED' | 'ALLOCATED' | 'OCCUPIED' | 'RELEASED' | 'CANCELLED';

export interface ParkingSlot {
  id: string;
  zoneId: string;
  areaId: string;
  slotNumber: number;
  isAvailable: boolean;
}

export interface Zone {
  id: string;
  name: string;
  areas: ParkingArea[];
  totalSlots: number;
  availableSlots: number;
}

export interface ParkingArea {
  id: string;
  name: string;
  zoneId: string;
  slots: ParkingSlot[];
}

export interface ParkingRequest {
  id: string;
  licensePlate: string;
  zoneId: string;
  slotId: string | null;
  slotNumber: number | null;
  duration: number; // hours
  hourlyRate: number;
  baseFee: number;
  totalCharges: number;
  status: RequestStatus;
  createdAt: Date;
  allocatedAt: Date | null;
  releasedAt: Date | null;
}

export interface AllocationOperation {
  type: 'ALLOCATE' | 'RELEASE' | 'CANCEL';
  requestId: string;
  slotId: string;
  timestamp: Date;
}

export interface SystemAnalytics {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  activeRequests: number;
  completedSessions: number;
  cancelledSessions: number;
  totalRevenue: number;
  zoneStats: {
    zoneId: string;
    zoneName: string;
    total: number;
    occupied: number;
    available: number;
  }[];
}

// Constants
const HOURLY_RATE = 5.0;
const BASE_FEE = 2.0;
const SLOTS_PER_AREA = 10;
const AREAS_PER_ZONE = 2;

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Initialize zones with parking areas and slots
export function initializeZones(): Zone[] {
  const zoneNames = ['Downtown Core', 'Tech District', 'Harbor View', 'Central Plaza', 'East Gateway'];
  
  return zoneNames.map((name, zoneIndex) => {
    const zoneId = `zone-${zoneIndex + 1}`;
    const areas: ParkingArea[] = [];
    
    for (let areaIndex = 0; areaIndex < AREAS_PER_ZONE; areaIndex++) {
      const areaId = `${zoneId}-area-${areaIndex + 1}`;
      const slots: ParkingSlot[] = [];
      
      for (let slotIndex = 0; slotIndex < SLOTS_PER_AREA; slotIndex++) {
        const slotNumber = zoneIndex * 100 + areaIndex * 10 + slotIndex + 1;
        slots.push({
          id: `${areaId}-slot-${slotIndex + 1}`,
          zoneId,
          areaId,
          slotNumber,
          isAvailable: true,
        });
      }
      
      areas.push({
        id: areaId,
        name: `Area ${String.fromCharCode(65 + areaIndex)}`,
        zoneId,
        slots,
      });
    }
    
    return {
      id: zoneId,
      name,
      areas,
      totalSlots: AREAS_PER_ZONE * SLOTS_PER_AREA,
      availableSlots: AREAS_PER_ZONE * SLOTS_PER_AREA,
    };
  });
}

// Calculate charges
export function calculateCharges(duration: number): { hourlyRate: number; baseFee: number; total: number } {
  const total = (duration * HOURLY_RATE) + BASE_FEE;
  return { hourlyRate: HOURLY_RATE, baseFee: BASE_FEE, total };
}

// Parking System Class
export class ParkingSystem {
  private zones: Zone[];
  private requests: Map<string, ParkingRequest>;
  private slotQueue: Map<string, string[]>; // zoneId -> available slot IDs
  private operationHistory: AllocationOperation[];
  
  constructor() {
    this.zones = initializeZones();
    this.requests = new Map();
    this.slotQueue = new Map();
    this.operationHistory = [];
    
    // Initialize slot queues for each zone
    this.zones.forEach(zone => {
      const slotIds: string[] = [];
      zone.areas.forEach(area => {
        area.slots.forEach(slot => {
          slotIds.push(slot.id);
        });
      });
      this.slotQueue.set(zone.id, slotIds);
    });
  }
  
  getZones(): Zone[] {
    return this.zones;
  }
  
  getRequests(): ParkingRequest[] {
    return Array.from(this.requests.values());
  }
  
  getActiveRequests(): ParkingRequest[] {
    return this.getRequests().filter(r => 
      r.status === 'ALLOCATED' || r.status === 'OCCUPIED'
    );
  }
  
  getHistoryRequests(): ParkingRequest[] {
    return this.getRequests().filter(r => 
      r.status === 'RELEASED' || r.status === 'CANCELLED'
    );
  }
  
  // Allocate first available slot from queue
  allocateSlot(zoneId: string, licensePlate: string, duration: number): ParkingRequest | null {
    const queue = this.slotQueue.get(zoneId);
    if (!queue || queue.length === 0) {
      // Try cross-zone allocation
      for (const zone of this.zones) {
        const altQueue = this.slotQueue.get(zone.id);
        if (altQueue && altQueue.length > 0) {
          return this.performAllocation(zone.id, altQueue, licensePlate, duration);
        }
      }
      return null;
    }
    
    return this.performAllocation(zoneId, queue, licensePlate, duration);
  }
  
  private performAllocation(
    zoneId: string, 
    queue: string[], 
    licensePlate: string, 
    duration: number
  ): ParkingRequest {
    const slotId = queue.shift()!; // Pop from queue
    const charges = calculateCharges(duration);
    
    // Find and update slot
    const slot = this.findSlot(slotId);
    if (slot) {
      slot.isAvailable = false;
    }
    
    // Update zone availability
    const zone = this.zones.find(z => z.id === zoneId);
    if (zone) {
      zone.availableSlots--;
    }
    
    const request: ParkingRequest = {
      id: generateId(),
      licensePlate: licensePlate.toUpperCase(),
      zoneId,
      slotId,
      slotNumber: slot?.slotNumber ?? null,
      duration,
      hourlyRate: charges.hourlyRate,
      baseFee: charges.baseFee,
      totalCharges: charges.total,
      status: 'ALLOCATED',
      createdAt: new Date(),
      allocatedAt: new Date(),
      releasedAt: null,
    };
    
    this.requests.set(request.id, request);
    
    // Record operation for rollback
    this.operationHistory.push({
      type: 'ALLOCATE',
      requestId: request.id,
      slotId,
      timestamp: new Date(),
    });
    
    return request;
  }
  
  // Release slot and return to queue
  releaseSlot(requestId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request || !request.slotId) return false;
    
    if (request.status !== 'ALLOCATED' && request.status !== 'OCCUPIED') {
      return false;
    }
    
    // Return slot to queue
    const queue = this.slotQueue.get(request.zoneId);
    if (queue) {
      queue.push(request.slotId);
    }
    
    // Update slot availability
    const slot = this.findSlot(request.slotId);
    if (slot) {
      slot.isAvailable = true;
    }
    
    // Update zone availability
    const zone = this.zones.find(z => z.id === request.zoneId);
    if (zone) {
      zone.availableSlots++;
    }
    
    request.status = 'RELEASED';
    request.releasedAt = new Date();
    
    this.operationHistory.push({
      type: 'RELEASE',
      requestId,
      slotId: request.slotId,
      timestamp: new Date(),
    });
    
    return true;
  }
  
  // Cancel request and rollback
  cancelRequest(requestId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request) return false;
    
    if (request.status === 'RELEASED' || request.status === 'CANCELLED') {
      return false;
    }
    
    if (request.slotId) {
      // Return slot to queue
      const queue = this.slotQueue.get(request.zoneId);
      if (queue) {
        queue.push(request.slotId);
      }
      
      // Update slot availability
      const slot = this.findSlot(request.slotId);
      if (slot) {
        slot.isAvailable = true;
      }
      
      // Update zone availability
      const zone = this.zones.find(z => z.id === request.zoneId);
      if (zone) {
        zone.availableSlots++;
      }
    }
    
    request.status = 'CANCELLED';
    request.releasedAt = new Date();
    
    this.operationHistory.push({
      type: 'CANCEL',
      requestId,
      slotId: request.slotId || '',
      timestamp: new Date(),
    });
    
    return true;
  }
  
  // Rollback last k operations
  rollback(k: number): boolean {
    const opsToRollback = this.operationHistory.slice(-k).reverse();
    
    for (const op of opsToRollback) {
      const request = this.requests.get(op.requestId);
      if (!request) continue;
      
      if (op.type === 'ALLOCATE') {
        // Undo allocation
        if (op.slotId) {
          const queue = this.slotQueue.get(request.zoneId);
          if (queue) queue.push(op.slotId);
          
          const slot = this.findSlot(op.slotId);
          if (slot) slot.isAvailable = true;
          
          const zone = this.zones.find(z => z.id === request.zoneId);
          if (zone) zone.availableSlots++;
        }
        this.requests.delete(op.requestId);
      }
    }
    
    this.operationHistory = this.operationHistory.slice(0, -k);
    return true;
  }
  
  private findSlot(slotId: string): ParkingSlot | null {
    for (const zone of this.zones) {
      for (const area of zone.areas) {
        const slot = area.slots.find(s => s.id === slotId);
        if (slot) return slot;
      }
    }
    return null;
  }
  
  getAnalytics(): SystemAnalytics {
    const requests = this.getRequests();
    const activeRequests = requests.filter(r => 
      r.status === 'ALLOCATED' || r.status === 'OCCUPIED'
    );
    const completedSessions = requests.filter(r => r.status === 'RELEASED');
    const cancelledSessions = requests.filter(r => r.status === 'CANCELLED');
    
    const totalSlots = this.zones.reduce((sum, z) => sum + z.totalSlots, 0);
    const availableSlots = this.zones.reduce((sum, z) => sum + z.availableSlots, 0);
    
    return {
      totalSlots,
      occupiedSlots: totalSlots - availableSlots,
      availableSlots,
      activeRequests: activeRequests.length,
      completedSessions: completedSessions.length,
      cancelledSessions: cancelledSessions.length,
      totalRevenue: completedSessions.reduce((sum, r) => sum + r.totalCharges, 0),
      zoneStats: this.zones.map(zone => ({
        zoneId: zone.id,
        zoneName: zone.name,
        total: zone.totalSlots,
        occupied: zone.totalSlots - zone.availableSlots,
        available: zone.availableSlots,
      })),
    };
  }
}

// Singleton instance
let systemInstance: ParkingSystem | null = null;

export function getParkingSystem(): ParkingSystem {
  if (!systemInstance) {
    systemInstance = new ParkingSystem();
  }
  return systemInstance;
}

// License plate validation
export function validateLicensePlate(plate: string): boolean {
  // Basic validation: 2-10 alphanumeric characters
  const pattern = /^[A-Z0-9]{2,10}$/;
  return pattern.test(plate.toUpperCase().replace(/[\s-]/g, ''));
}

export function formatLicensePlate(plate: string): string {
  return plate.toUpperCase().replace(/[\s-]/g, '');
}
