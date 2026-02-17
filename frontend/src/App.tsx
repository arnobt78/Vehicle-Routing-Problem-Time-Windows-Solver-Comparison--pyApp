import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { AppLayout } from "@/components/layout/AppLayout";

function App() {
  return (
    <QueryProvider>
      <Toaster richColors position="bottom-right" closeButton expand />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />} />
          <Route path="/solver" element={<AppLayout />} />
          <Route path="/compare" element={<AppLayout />} />
          <Route path="/datasets" element={<AppLayout />} />
          <Route path="/results" element={<AppLayout />} />
          <Route path="/api-status-documentation" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
