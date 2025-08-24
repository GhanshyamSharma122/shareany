import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import RetrievePage from "./pages/RetrievePage";
import SimpleShareAny from "./pages/SimpleShareAny";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SimpleShareAny />} />
        <Route path="/:keyword" element={<RetrievePage />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
