import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../components/landing";
import AuthComponent from "../components/auth";
import DeployFailed from "../components/deployFailed";
import ProtectedRoute from "../components/protectLanding";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/landing"
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<AuthComponent />} />
        <Route
          path="/deploy-failed"
          element={
            <ProtectedRoute>
              <DeployFailed />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
