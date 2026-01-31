import { motion } from 'framer-motion';
import { useParking } from '@/contexts/ParkingContext';
import { 
  Car, 
  ParkingCircle, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  TrendingUp,
  MapPin
} from 'lucide-react';
import heroImage from '@/assets/hero-parking.jpg';

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

export function DashboardPage() {
  const { analytics, zones } = useParking();
  
  const occupancyPercent = Math.round((analytics.occupiedSlots / analytics.totalSlots) * 100);
  
  const getStatusLabel = () => {
    if (occupancyPercent >= 90) return { label: 'Full', class: 'status-occupied' };
    if (occupancyPercent >= 70) return { label: 'Filling Fast', class: 'status-filling' };
    return { label: 'Available', class: 'status-available' };
  };
  
  const status = getStatusLabel();
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="relative h-64 rounded-2xl overflow-hidden"
      >
        <img 
          src={heroImage} 
          alt="Smart Parking Zone" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 p-8 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Smart Parking <span className="gradient-text text-glow">Zone</span>
          </h1>
          <p className="text-muted-foreground max-w-md">
            Real-time parking allocation and zone management system for urban efficiency
          </p>
          <div className="flex items-center gap-4 mt-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.class}`}>
              {status.label}
            </span>
            <span className="text-sm text-muted-foreground">
              {analytics.availableSlots} slots available across {zones.length} zones
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Main Metrics */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          icon={Car}
          label="Currently Active"
          value={analytics.activeRequests}
          sublabel="Active sessions"
          color="primary"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Sessions Completed"
          value={analytics.completedSessions}
          sublabel="Successfully released"
          color="success"
        />
        <MetricCard
          icon={XCircle}
          label="Sessions Cancelled"
          value={analytics.cancelledSessions}
          sublabel="Cancelled bookings"
          color="destructive"
        />
        <MetricCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(2)}`}
          sublabel="From completed sessions"
          color="warning"
        />
      </motion.div>
      
      {/* Occupancy Gauge */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 metric-card">
          <h3 className="text-lg font-semibold text-foreground mb-6">System Occupancy</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="96"
                cy="96"
                r="80"
                stroke="hsl(var(--primary))"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 80 * (1 - occupancyPercent / 100) 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground font-mono-data">
                {occupancyPercent}%
              </span>
              <span className="text-sm text-muted-foreground">Occupied</span>
            </div>
          </div>
          <div className="mt-6 flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Occupied</span>
              <p className="font-bold text-foreground font-mono-data">{analytics.occupiedSlots}</p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Available</span>
              <p className="font-bold text-success font-mono-data">{analytics.availableSlots}</p>
            </div>
          </div>
        </div>
        
        {/* Zone Status */}
        <div className="lg:col-span-2 metric-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Zone Status</h3>
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {analytics.zoneStats.map((zone, index) => {
              const zonePercent = Math.round((zone.occupied / zone.total) * 100);
              return (
                <motion.div
                  key={zone.zoneId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{zone.zoneName}</span>
                    <span className="text-muted-foreground font-mono-data">
                      {zone.occupied}/{zone.total} slots
                    </span>
                  </div>
                  <div className="slider-track">
                    <motion.div
                      className="slider-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${zonePercent}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      {/* Queue Status Card */}
      <motion.div variants={itemVariants} className="metric-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Queue Status</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time slot availability in allocation queue
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <span className="text-2xl font-bold text-success font-mono-data">
              {analytics.availableSlots}
            </span>
            <span className="text-muted-foreground">slots free</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel: string;
  color: 'primary' | 'success' | 'destructive' | 'warning';
}

function MetricCard({ icon: Icon, label, value, sublabel, color }: MetricCardProps) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    destructive: 'text-destructive bg-destructive/10',
    warning: 'text-warning bg-warning/10',
  };
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400 }}
      className="metric-card hover-glow transition-glow"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-foreground font-mono-data">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{sublabel}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}
