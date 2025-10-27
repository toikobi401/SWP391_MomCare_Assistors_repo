import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { LayoutDefault } from "./layouts/LayoutDefault";
import { HomePage } from "./pages/Home/Home";
import { LoginPage } from "./pages/Auth/Login";
import { RegisterPage } from "./pages/Auth/Register";
import { Error404Page } from "./pages/Error/Error404";
import { CategoryPage } from "./pages/Category/Category";
import { UserPage } from "./pages/User/User";
import { ProfilePage } from "./pages/User/Profile";

import { BlogGrid } from "./pages/Blog/BlogGrid";
import { BlogDetails } from "./pages/Blog/BlogDetails";
import { ProtectedRoute } from "./components/Route/ProtectedRoute";
import { ForgotPasswordPage } from "./pages/Auth/ForgotPassword";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { ProtectedAdminRoute } from "./components/Route/ProtectedAdminRoute";
import { OvulationCal } from "./pages/Service/OvulationCal";
import { EstimateDoB } from "./pages/Service/EstimatedDoB";
import { EstimatedWeight } from "./pages/Service/EstimatedWeight";
import { Chat } from "./pages/Chat/Chat";

function App() {
  return (
    <>
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />

            <Route element={<LayoutDefault />}>
              <Route path="/" element={<HomePage />} />
              <Route path="category" element={<CategoryPage />} />
              <Route path="users" element={<UserPage />} />
              <Route path="blog" element={<BlogGrid />} />
              <Route path="blog/:id" element={<BlogDetails />} />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <ProtectedAdminRoute>
                      <DashboardPage />
                    </ProtectedAdminRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="ovulation" element={<OvulationCal />} />
            <Route path="caldob" element={<EstimateDoB />} />
            <Route path="calweight" element={<EstimatedWeight />} />
            <Route path="*" element={<Error404Page />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
