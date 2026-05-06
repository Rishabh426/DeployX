import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../components/landing";
import AuthComponent from "../components/auth";
import DeployFailed from "../components/deployFailed";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthComponent />} />
        <Route path="/deploy-failed" element={<DeployFailed />} />
      </Routes>
    </BrowserRouter>
  );
}
