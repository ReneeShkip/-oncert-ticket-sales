import { useState, useEffect } from "react";
import Header from "./components/header";
import Chat from "./components/chat";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext.jsx";


function App() {

  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [hover, setHover] = useState("/svg/to_top.svg")

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuth(true);
    }
  }, []);

  return (
    <UserProvider>
      <CartProvider>
        <div className="page">
          <div id="top"></div>
          <Header />
          <Chat />
          <main>
            <Outlet />
          </main>
          <a href="#top" className="top">
            <img
              onMouseEnter={() => setHover("/svg/top_hover.svg")}
              onMouseLeave={() => setHover("/svg/to_top.svg")}
              src={hover} alt="Вгору" /></a>
          <Footer />
        </div>
      </CartProvider>
    </UserProvider>
  );
}
export default App;