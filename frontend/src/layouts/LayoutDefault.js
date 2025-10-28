import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import { Chatbot } from "../components/Chatbot/Chatbot";

export const LayoutDefault = () => {
  const location = useLocation();
  const pathStyle = {
    "/dashboard": {},
    "/": {
      padding: "100px 0",
    },
    default: {
      padding: "100px 0",
    },
  };

  const mainStyle = pathStyle[location.pathname] || location.default;

  const noFooterPaths = ["/dashboard", "/chat"];
  const noChatbotPaths = [];
  const showFooter = !noFooterPaths.includes(location.pathname);
  const showChatbot = !noChatbotPaths.includes(location.pathname);

  return (
    <>
      {showChatbot && <Chatbot />}
      <div className="fixed-top">
        <Header />
      </div>
      <main style={mainStyle}>
        <Outlet />
      </main>

      {showFooter && <Footer />}
    </>
  );
};
