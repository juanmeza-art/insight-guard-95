import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Proposals from "./pages/Proposals";
import ClientPerformance from "./pages/ClientPerformance";
import RolePerformance from "./pages/RolePerformance";
import TeamPerformance from "./pages/TeamPerformance";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Index />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/client-performance" element={<ClientPerformance />} />
            <Route path="/role-performance" element={<RolePerformance />} />
            <Route path="/team-performance" element={<TeamPerformance />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
