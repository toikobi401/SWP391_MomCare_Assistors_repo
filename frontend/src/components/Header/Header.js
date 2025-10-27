import { NavLink } from "react-router-dom";
import { HeaderAccount } from "./HeaderAccount";
import { useAuth } from "../../hooks/useAuth";

export const Header = () => {
  const { infoUser } = useAuth();
  const isAdmin = "Admin" === infoUser?.RoleName;

  return (
    <>
      <header className="header header-transparent rs-nav">
        <div className="sticky-header navbar-expand-lg">
          <div className="menu-bar clearfix">
            <div className="container-fluid clearfix bg-white">
              <div className="menu-logo logo-dark">
                <a href="/">
                  <img src="images/logo.png" alt="" />
                </a>
              </div>
              <button
                className="navbar-toggler collapsed menuicon justify-content-end"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#menuDropdown"
                aria-controls="menuDropdown"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
              <div className="secondary-menu">
                <ul>
                  <li className="num-bx">
                    <a href="tel:(+01)999888777">
                      <i className="fas fa-phone-alt"></i> (+01) 999 888 777
                    </a>
                  </li>
                  <li className="search-btn">
                    <form
                      action="#"
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <input
                        name="search"
                        defaultValue=""
                        type="text"
                        className="form-control"
                        placeholder="Type to search"
                        style={{ paddingLeft: "40px" }}
                      />
                      <i
                        className="ti-search"
                        style={{
                          position: "absolute",
                          top: "35%",
                          left: "15px",
                        }}
                      ></i>
                    </form>
                  </li>
                  <HeaderAccount />
                </ul>
              </div>
              <div
                className="menu-links navbar-collapse collapse justify-content-center"
                id="menuDropdown"
              >
                <div className="menu-logo">
                  <a href="/">
                    <img src="images/logo-white.png" alt="" />
                  </a>
                </div>
                <ul className="nav navbar-nav">
                  <li>
                    <NavLink to="/services">Services</NavLink>
                  </li>

                  <li>
                    <NavLink to="/blog">Blogs</NavLink>
                  </li>

                  <li>
                    <NavLink to="/faq">FAQs</NavLink>
                  </li>

                  <li>
                    <NavLink to="/about">About Us</NavLink>
                  </li>

                  <li>
                    <NavLink to="/chat">Contact</NavLink>
                  </li>
                  {isAdmin ? (
                    <>
                      <li>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                      </li>
                    </>
                  ) : (
                    <></>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
