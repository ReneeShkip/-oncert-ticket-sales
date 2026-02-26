import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Catalog from "./pages/Catalog";
import Authors from "./pages/Authors";
import Publishers from "./pages/Publishers";
import AuthorDetails from "./pages/Author_Details";
import BookDetails from "./pages/Book_Details.jsx";
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
      { path: "authors", element: <Authors /> },
      { path: "publishers", element: <Publishers /> },
      { path: "author/details/:id", element: <AuthorDetails /> },
      { path: "book/details/:id", element: <BookDetails /> },
      { path: "/books/filteredbooks/:category?", element: <SetBooks /> },
      { path: "/profile", element: <MyProfile /> },
      { path: "/publisher/details/:id", element: <Publisher_Details /> },
      { path: "/cart", element: <Cart /> },
      { path: "/order", element: <Order /> },
      { path: "/admin/cart", element: <Cart_for_admins /> },
      { path: "/returner", element: <Returner /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);


