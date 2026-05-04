import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../components/landing";
import AuthComponent from "../components/auth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthComponent />} />
      </Routes>
    </BrowserRouter>
  );
}
