import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ParkingCircle, 
  Activity, 
  History, 
  Car 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParking } from '@/contexts/ParkingContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/reserve', label: 'New Reservation', icon: ParkingCircle },
  { path: '/active', label: 'Active Sessions', icon: Activity },
  { path: '/history', label: 'Trip History', icon: History },
];

export function AppSidebar() {
  const location = useLocation();
  const { analytics } = useParking();
  
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full pulse-live" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm">Smart Parking</h1>
            <p className="text-xs text-muted-foreground">Zone Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className="font-medium text-sm">{item.label}</span>
                
                {/* Badge for active sessions */}
                {item.path === '/active' && analytics.activeRequests > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {analytics.activeRequests}
                  </span>
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>
      
      {/* Status footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">System Status</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">Online</span>
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono-data">
            {analytics.availableSlots}
            <span className="text-sm text-muted-foreground font-normal ml-1">
              / {analytics.totalSlots}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Slots Available</p>
        </div>
      </div>
    </aside>
  );
}
