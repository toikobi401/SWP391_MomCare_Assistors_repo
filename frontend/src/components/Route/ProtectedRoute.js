import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedRoute = (props) => {
  const { children } = props;
  const { isLogin } = useAuth();
  
  return isLogin ? children : <Navigate to="/login" />;
}