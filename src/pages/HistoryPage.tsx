import { motion } from 'framer-motion';
import { useParking } from '@/contexts/ParkingContext';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, History, Car, DollarSign, TrendingUp } from 'lucide-react';

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

export function HistoryPage() {
  const { historyRequests, zones, analytics } = useParking();
  
  const getZoneName = (zoneId: string) => {
    return zones.find(z => z.id === zoneId)?.name || 'Unknown Zone';
  };
  
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const completedRevenue = historyRequests
    .filter(r => r.status === 'RELEASED')
    .reduce((sum, r) => sum + r.totalCharges, 0);
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-foreground">Trip History</h1>
        <p className="text-muted-foreground mt-2">
          View all completed and cancelled parking sessions
        </p>
      </motion.div>
      
      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono-data">
                {analytics.completedSessions}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono-data">
                {analytics.cancelledSessions}
              </p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success font-mono-data">
                ${completedRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono-data">
                {historyRequests.length > 0 
                  ? Math.round((analytics.completedSessions / historyRequests.length) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* History Table */}
      <motion.div variants={itemVariants} className="metric-card p-0 overflow-hidden">
        {historyRequests.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No History Yet</h3>
            <p className="text-muted-foreground">
              Completed and cancelled sessions will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">License Plate</TableHead>
                  <TableHead className="text-muted-foreground">Slot</TableHead>
                  <TableHead className="text-muted-foreground">Zone</TableHead>
                  <TableHead className="text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-muted-foreground">Charges</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-border hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Car className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-mono-data font-bold">{request.licensePlate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono-data text-muted-foreground">
                      #{request.slotNumber}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {getZoneName(request.zoneId)}
                    </TableCell>
                    <TableCell className="font-mono-data">
                      {request.duration}h
                    </TableCell>
                    <TableCell className="font-mono-data font-bold text-foreground">
                      ${request.totalCharges.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {request.status === 'RELEASED' ? (
                        <Badge variant="outline" className="border-success/30 text-success bg-success/10">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10">
                          <XCircle className="w-3 h-3 mr-1" />
                          Cancelled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {request.releasedAt ? formatDateTime(request.releasedAt) : '-'}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
