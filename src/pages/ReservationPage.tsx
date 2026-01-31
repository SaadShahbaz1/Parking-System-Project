import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParking } from '@/contexts/ParkingContext';
import { validateLicensePlate, formatLicensePlate } from '@/lib/parking-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Car, Clock, DollarSign, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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

export function ReservationPage() {
  const { zones, calculatePrice, allocateSlot, analytics } = useParking();
  
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [duration, setDuration] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ licensePlate?: string; zone?: string }>({});
  
  const pricing = useMemo(() => calculatePrice(duration), [duration, calculatePrice]);
  
  const selectedZoneData = zones.find(z => z.id === selectedZone);
  
  const handleLicensePlateChange = (value: string) => {
    const formatted = formatLicensePlate(value);
    setLicensePlate(formatted);
    if (errors.licensePlate) {
      setErrors(prev => ({ ...prev, licensePlate: undefined }));
    }
  };
  
  const handleZoneChange = (value: string) => {
    setSelectedZone(value);
    if (errors.zone) {
      setErrors(prev => ({ ...prev, zone: undefined }));
    }
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(e.target.value));
  };
  
  const validateForm = (): boolean => {
    const newErrors: { licensePlate?: string; zone?: string } = {};
    
    if (!licensePlate) {
      newErrors.licensePlate = 'License plate is required';
    } else if (!validateLicensePlate(licensePlate)) {
      newErrors.licensePlate = 'Invalid license plate format (2-10 alphanumeric characters)';
    }
    
    if (!selectedZone) {
      newErrors.zone = 'Please select a zone';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleBookClick = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };
  
  const handleConfirmBooking = () => {
    const result = allocateSlot(selectedZone, licensePlate, duration);
    setShowConfirmation(false);
    
    if (result) {
      setBookedSlot(result.slotNumber);
      setShowSuccess(true);
      toast.success('Parking slot booked successfully!');
      
      // Reset form
      setLicensePlate('');
      setSelectedZone('');
      setDuration(1);
    } else {
      toast.error('No slots available. Please try another zone.');
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-foreground">New Reservation</h1>
        <p className="text-muted-foreground mt-2">
          Book a parking slot in your preferred zone
        </p>
      </motion.div>
      
      {/* Form */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form Inputs */}
        <div className="space-y-6">
          {/* License Plate */}
          <div className="metric-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <Label className="text-lg font-semibold text-foreground">
                Vehicle Information
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate" className="text-sm text-muted-foreground">
                License Plate Number
              </Label>
              <Input
                id="licensePlate"
                value={licensePlate}
                onChange={(e) => handleLicensePlateChange(e.target.value)}
                placeholder="e.g., ABC1234"
                className="font-mono text-lg tracking-wider uppercase"
                maxLength={10}
              />
              {errors.licensePlate && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.licensePlate}
                </p>
              )}
            </div>
          </div>
          
          {/* Zone Selection */}
          <div className="metric-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <Label className="text-lg font-semibold text-foreground">
                Select Zone
              </Label>
            </div>
            <Select value={selectedZone} onValueChange={handleZoneChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a parking zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map(zone => (
                  <SelectItem key={zone.id} value={zone.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{zone.name}</span>
                      <span className="ml-4 text-xs text-muted-foreground">
                        {zone.availableSlots}/{zone.totalSlots} available
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.zone && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                <AlertCircle className="w-4 h-4" />
                {errors.zone}
              </p>
            )}
            {selectedZoneData && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available slots:</span>
                  <span className={`font-bold font-mono-data ${
                    selectedZoneData.availableSlots > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {selectedZoneData.availableSlots}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Duration Slider */}
          <div className="metric-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <Label className="text-lg font-semibold text-foreground">
                Parking Duration
              </Label>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Duration</span>
                <span className="text-2xl font-bold text-primary font-mono-data">
                  {duration} {duration === 1 ? 'hour' : 'hours'}
                </span>
              </div>
              
              {/* Custom styled slider */}
              <div className="relative py-4">
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={duration}
                  onChange={handleSliderChange}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer bg-muted
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-6
                    [&::-webkit-slider-thumb]:h-6
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:border-4
                    [&::-webkit-slider-thumb]:border-background
                    [&::-webkit-slider-thumb]:cursor-grab
                    [&::-webkit-slider-thumb]:active:cursor-grabbing
                    [&::-webkit-slider-thumb]:shadow-[0_0_15px_hsl(var(--primary)/0.5)]
                    [&::-webkit-slider-thumb]:transition-shadow
                    [&::-webkit-slider-thumb]:hover:shadow-[0_0_20px_hsl(var(--primary)/0.7)]
                  "
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((duration - 1) / 23) * 100}%, hsl(var(--muted)) ${((duration - 1) / 23) * 100}%, hsl(var(--muted)) 100%)`
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 hour</span>
                <span>24 hours</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Pricing Summary */}
        <div className="space-y-6">
          <div className="metric-card glass-card-glow sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Live Charges</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Hourly Rate</span>
                <span className="font-mono-data text-foreground">
                  ${pricing.hourlyRate.toFixed(2)}/hr
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-mono-data text-foreground">
                  {duration} {duration === 1 ? 'hour' : 'hours'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Duration Cost</span>
                <span className="font-mono-data text-foreground">
                  ${(duration * pricing.hourlyRate).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Base Fee</span>
                <span className="font-mono-data text-foreground">
                  ${pricing.baseFee.toFixed(2)}
                </span>
              </div>
              
              <motion.div
                key={pricing.total}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="flex justify-between items-center py-4 bg-primary/10 rounded-lg px-4 -mx-2"
              >
                <span className="text-lg font-semibold text-foreground">Total</span>
                <span className="text-3xl font-bold text-primary font-mono-data text-glow">
                  ${pricing.total.toFixed(2)}
                </span>
              </motion.div>
            </div>
            
            <Button
              onClick={handleBookClick}
              className="w-full mt-6 h-14 text-lg font-semibold"
              size="lg"
            >
              <Car className="w-5 h-5 mr-2" />
              Book Slot
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              {analytics.availableSlots} slots currently available
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Booking</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please review your reservation details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">License Plate</span>
              <span className="font-mono-data font-bold">{licensePlate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Zone</span>
              <span className="font-medium">{selectedZoneData?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-mono-data">{duration} hours</span>
            </div>
            <div className="flex justify-between py-2 bg-primary/10 rounded-lg px-3">
              <span className="font-semibold">Total Charges</span>
              <span className="font-bold text-primary font-mono-data">
                ${pricing.total.toFixed(2)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="glass-card border-border text-center">
          <div className="py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6"
            >
              <CheckCircle className="w-10 h-10 text-success" />
            </motion.div>
            <DialogTitle className="text-2xl mb-2">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              Your parking slot has been successfully allocated
            </DialogDescription>
            {bookedSlot && (
              <div className="bg-primary/10 rounded-xl p-6 inline-block">
                <p className="text-sm text-muted-foreground mb-2">Your Slot Number</p>
                <p className="text-4xl font-bold text-primary font-mono-data text-glow">
                  #{bookedSlot}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="justify-center">
            <Button onClick={() => setShowSuccess(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
