import { createContext, useState, useEffect } from "react";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [authError, setAuthError] = useState("");

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) return;

        try {
            const parsedUser = JSON.parse(savedUser);

            if (parsedUser?.id) {
                setUser(parsedUser);
                setIsAuth(true);
            } else {
                localStorage.removeItem("user");
            }
        } catch {
            localStorage.removeItem("user");
        }
    }, []);


    const handleRegister = async (userData) => {
        setAuthError("");
        try {
            const res = await fetch("http://localhost:5000/sign_up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.details || "Помилка реєстрації");
            }

            const newUser = {
                id: data.id,
                first_name: data.first_name,
                last_name: data.last_name,
                phone_number: data.phone_number,
                role: data.role,
                city: data.city,
                email: data.email
            };

            setUser(newUser);
            setIsAuth(true);
            localStorage.setItem('user', JSON.stringify(newUser));

            return newUser;
        } catch (err) {
            console.error("Registration error:", err);
            setAuthError(err.message);
            throw err;
        }
    };

    const handleLogin = async (form) => {
        setAuthError("");
        try {
            const res = await fetch("http://localhost:5000/log_in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Невірна пошта або пароль");
            }

            setUser(data);
            setIsAuth(true);
            localStorage.setItem('user', JSON.stringify(data));
        } catch (err) {
            console.error("Login error:", err);
            setAuthError(err.message || "Помилка з'єднання з сервером");
            throw err;
        }
    };

    const handleLogout = () => {
        setIsAuth(false);
        setUser(null);
        localStorage.removeItem('user');
    };
    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                isAuth,
                setIsAuth,
                authError,
                handleRegister,
                handleLogin,
                handleLogout,
                setAuthError
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
