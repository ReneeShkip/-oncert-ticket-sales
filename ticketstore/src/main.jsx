import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MoreProvider } from "./context/MoreContext";
import App from "./App";
import Catalog from "./pages/Catalog";
import Performers from "./pages/Performers";
import Publishers from "./pages/Publishers";
import PerformerDetails from "./pages/Performer_Details";
import EventDetails from "./pages/Event_Details.jsx";
import NotFound from "./pages/notfound.jsx";
import SetBooks from "./pages/Set_of_books.jsx";
import MyProfile from "./pages/My_Profile.jsx";
import Order from "./pages/Order.jsx";
import Cart from "./pages/Cart.jsx";
import Returner from "./pages/Returner.jsx";
import Cart_for_admins from "./pages/Cart_for_admins.jsx";
import Publisher_Details from "./pages/Publisher_details.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Catalog /> },
      { path: "performers", element: <Performers /> },
      { path: "publishers", element: <Publishers /> },
      { path: "performers/details/:id", element: <PerformerDetails /> },
      { path: "event/details/:id", element: <EventDetails /> },
      { path: "/event/filteredbooks/:category?", element: <SetBooks /> },
      { path: "/profile", element: <MyProfile /> },
      { path: "/publisher/details/:id", element: <Publisher_Details /> },
      { path: "/cart", element: <Cart /> },
      { path: "/order", element: <Order /> },
      { path: "/admin/cart", element: <Cart_for_admins /> },
      { path: "/returner", element: <Returner /> },
      { path: "/verify/:id", element: <Verify /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <MoreProvider>
    <RouterProvider router={router} />
  </MoreProvider>
);