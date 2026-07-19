import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import DropPage from "./pages/DropPage";
import ClaimPage from "./pages/ClaimPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DropPage />} />
        <Route path="/:keyword" element={<ClaimPage />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
