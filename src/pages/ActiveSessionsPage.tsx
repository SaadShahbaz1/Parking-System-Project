import { motion } from 'framer-motion';
import { useParking } from '@/contexts/ParkingContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Car, 
  Clock, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { ParkingRequest } from '@/lib/parking-system';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function ActiveSessionsPage() {
  const { activeRequests, zones, releaseSlot, cancelRequest } = useParking();
  const [selectedRequest, setSelectedRequest] = useState<ParkingRequest | null>(null);
  const [actionType, setActionType] = useState<'release' | 'cancel' | null>(null);
  
  const getZoneName = (zoneId: string) => {
    return zones.find(z => z.id === zoneId)?.name || 'Unknown Zone';
  };
  
  const handleRelease = (request: ParkingRequest) => {
    setSelectedRequest(request);
    setActionType('release');
  };
  
  const handleCancel = (request: ParkingRequest) => {
    setSelectedRequest(request);
    setActionType('cancel');
  };
  
  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;
    
    if (actionType === 'release') {
      const success = releaseSlot(selectedRequest.id);
      if (success) {
        toast.success('Session completed successfully!');
      }
    } else {
      const success = cancelRequest(selectedRequest.id);
      if (success) {
        toast.success('Reservation cancelled');
      }
    }
    
    setSelectedRequest(null);
    setActionType(null);
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Active Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Manage ongoing parking sessions
          </p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-xl">
          <span className="text-sm text-muted-foreground">Active: </span>
          <span className="text-xl font-bold text-primary font-mono-data">
            {activeRequests.length}
          </span>
        </div>
      </motion.div>
      
      {/* Sessions Grid */}
      {activeRequests.length === 0 ? (
        <motion.div variants={itemVariants} className="metric-card text-center py-16">
          <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Active Sessions</h3>
          <p className="text-muted-foreground">
            All parking slots are currently available for booking
          </p>
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activeRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="metric-card hover-glow transition-glow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg font-mono-data text-foreground">
                      {request.licensePlate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Slot #{request.slotNumber}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium status-available">
                  {request.status}
                </span>
              </div>
              
              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Zone:</span>
                  <span className="text-foreground ml-auto">{getZoneName(request.zoneId)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="text-foreground ml-auto font-mono-data">
                    {request.duration} hours
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Charges:</span>
                  <span className="text-primary font-bold ml-auto font-mono-data">
                    ${request.totalCharges.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Time Info */}
              <div className="text-xs text-muted-foreground mb-4 py-2 border-t border-border">
                Allocated at {formatTime(request.allocatedAt!)}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-success/30 text-success hover:bg-success/10 hover:text-success"
                  onClick={() => handleRelease(request)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Release
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleCancel(request)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              actionType === 'release' ? 'bg-success/20' : 'bg-warning/20'
            }`}>
              {actionType === 'release' ? (
                <CheckCircle className="w-8 h-8 text-success" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-warning" />
              )}
            </div>
            <DialogTitle className="text-center text-xl">
              {actionType === 'release' ? 'Complete Session' : 'Cancel Reservation'}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {actionType === 'release' 
                ? 'This will mark the session as complete and free up the slot.'
                : 'This will cancel the reservation. No charges will apply.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-3 py-4 bg-muted/30 rounded-lg px-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">License Plate</span>
                <span className="font-mono-data font-bold">{selectedRequest.licensePlate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Slot</span>
                <span className="font-mono-data">#{selectedRequest.slotNumber}</span>
              </div>
              {actionType === 'release' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Charges</span>
                  <span className="font-mono-data text-success font-bold">
                    ${selectedRequest.totalCharges.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Go Back
            </Button>
            <Button
              variant={actionType === 'release' ? 'default' : 'destructive'}
              onClick={confirmAction}
            >
              {actionType === 'release' ? 'Complete Session' : 'Cancel Reservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
