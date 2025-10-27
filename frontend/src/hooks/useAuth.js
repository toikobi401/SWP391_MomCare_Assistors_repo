import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [infoUser, setInfoUser] = useState(null);
  const pathname = useLocation().pathname;
  
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/auth/check`, {
      credentials: "include" // Gửi kèm token
    })
      .then(res => res.json())
      .then(data => {
        if(data.code === "error") {
          setIsLogin(false);
        }

        if(data.code === "success") {
          setIsLogin(true);
          setInfoUser(data.infoUser);
        }
      })
  }, [pathname])

  return {
    isLogin: isLogin,
    infoUser: infoUser
  };
}
