import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ParkingProvider } from "@/contexts/ParkingContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ReservationPage } from "./pages/ReservationPage";
import { ActiveSessionsPage } from "./pages/ActiveSessionsPage";
import { HistoryPage } from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ParkingProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reserve" element={<ReservationPage />} />
              <Route path="/active" element={<ActiveSessionsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </ParkingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
