import { useState, useEffect, useContext } from "react";
import Header from "./components/header";
import Chat from "./components/chat";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { CartProvider, CartContext } from "./context/CartContext";
import { UserProvider } from "./context/UserContext.jsx";
import { MoreContext } from "./context/MoreContext";
import "./pages/Event_Details.jsx"
import { EventProvider } from "./context/EventContext.jsx";
import { PerformerProvider } from "./context/AuthorContext.jsx";
import Timer from "./utils/Timer.jsx";

function AppContent() {
  const { theme } = useContext(MoreContext);
  const { cart } = useContext(CartContext);

  return (
    <div className={`page ${theme}`} key="main">
      <Header />
      <Chat />
      <main><Outlet /></main>
      {cart.map(item => (
        <Timer key={`timer_${item.id}`} secondsLeft={item.seconds_left} />
      ))}
      <a href="#top" className="top" key="top">
        <img
          src={`/svg/to_top_${theme}.svg`} alt="Вгору" /></a>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <EventProvider>
          <PerformerProvider>
            <AppContent />
          </PerformerProvider>
        </EventProvider>
      </CartProvider>
    </UserProvider>
  );
}
export default App;