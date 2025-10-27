import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const HeaderAccount = () => {
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
      credentials: "include", // Gửi kèm token
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "success") {
          navigate("/login");
        }
      });
  };

  return (
    <>
      <li className="btn-area" style={{ position: "relative" }}>
        <div className="menu-links navbar-collapse collapse" id="menuDropdown">
          <ul className="nav navbar-nav">
            <li>
              <i className="fas fa-user" style={{ fontSize: "20px" }}></i>
              {isLogin ? (
                <>
                  <ul
                    className="sub-menu left"
                    style={{
                      position: "absolute",
                      top: "35px",
                      left: "-88px",
                      width: "auto",
                    }}
                  >
                    <li>
                      <a href="/profile">
                        <span>Profile</span>
                      </a>
                    </li>
                    <li onClick={handleLogout}>
                      <a href="#">
                        <span>Logout</span>
                      </a>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <ul
                    className="sub-menu left"
                    style={{
                      position: "absolute",
                      top: "35px",
                      left: "-88px",
                      width: "auto",
                    }}
                  >
                    <li>
                      <a href="/login">
                        <span>Login</span>
                      </a>
                    </li>
                    <li>
                      <a href="/register">
                        <span>Register</span>
                      </a>
                    </li>
                  </ul>
                </>
              )}
            </li>
          </ul>
        </div>
      </li>
    </>
  );
};
