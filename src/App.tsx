import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import SampleSelector from "./pages/SampleSelector";
import StarterPackGenerator from "./pages/StarterPackGenerator";
import CreatorLibrary from "./pages/CreatorLibrary";
import VoiceTool from "./pages/VoiceTool";
import VoiceGenerator from "./pages/VoiceGenerator";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/samples" element={<SampleSelector />} />
            <Route path="/generator" element={<StarterPackGenerator />} />
            <Route path="/library" element={<CreatorLibrary />} />
            <Route path="/voice" element={<VoiceTool />} />
            <Route path="/voice-generator" element={<VoiceGenerator />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;