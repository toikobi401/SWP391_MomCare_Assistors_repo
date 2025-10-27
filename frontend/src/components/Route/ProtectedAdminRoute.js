import { useAuth } from "../../hooks/useAuth";
import { HomePage } from "../../pages/Home/Home";

export const ProtectedAdminRoute = (props) => {
  const { children } = props;
  const { infoUser } = useAuth();

  const isAdmin = ("Admin" === infoUser?.RoleName);
  
  if (isAdmin) {
    return children;
  } else {
    return <HomePage />;
  }
}