import { createContext, useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
    const { user, isAuth } = useContext(UserContext);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!isAuth || !user?.id) {
            setCart([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/cart?user_id=${user.id}`);
            const data = await res.json();
            setCart(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuth, user?.id]);

    const addToCart = async (bookType, quantity = 1) => {

        const body = {
            user_id: user.id,
            book_id: bookType,
            quantity
        };

        try {
            const res = await fetch("http://localhost:5000/add_cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Не вдалося додати товар до кошика");

            await fetchCart();
        } catch (err) {
            console.error(err);
        }
    };


    const updateQuantity = async (id, qty) => {
        try {
            await fetch(`http://localhost:5000/cart/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    quantity: qty
                })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const removeItem = async (id) => {
        if (!id) {
            console.error("removeItem called with invalid id:", id);
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:5000/cart/${id}?user_id=${user.id}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error("Remove item failed");

            setCart(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const removeAll = async () => {
        try {
            const res = await fetch(
                `http://localhost:5000/cart?user_id=${user.id}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error("Remove all failed");

            setCart([]);
        } catch (err) {
            console.error(err);
        }
    };

    const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            setCart,
            loading,
            cartItemsCount,
            addToCart,
            updateQuantity,
            removeItem,
            removeAll,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
}