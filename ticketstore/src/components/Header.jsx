import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import Log_in from "./Log_in";
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { CartContext } from "../context/CartContext";
import { MoreContext } from "../context/MoreContext";

export default function Header() {
    const { user, isAuth, handleLogin, handleRegister, handleLogout, authError } = useContext(UserContext);
    const { cartItemsCount } = useContext(CartContext);
    const navigate = useNavigate();
    const { lang, changeLang, theme, changeTheme } = useContext(MoreContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const menuRef = useRef(null);
    const btnRef = useRef(null);
    const toggleMenu = () => setMenuOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const translator = {
        subheaders: {
            ukr: {
                Events: "Події",
                Organizations: "Виконавці"
            },
            eng: {
                Events: "Events",
                Organizations: "Performers"
            }
        }
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                filterref.current &&
                !filterref.current.contains(e.target)
            ) {
                setFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function applySearch() {
        if (!searchText.trim()) return;

        navigate("/books/filteredbooks", {
            state: { mode: "search", q: searchText }
        });
    }

    useEffect(() => {
        if (isAuth && user?.id) {
            fetchCart();
        }
    }, [isAuth, user?.id]);

    const fetchCart = async () => {
        if (!isAuth || !user?.id) return;

        try {
            const res = await fetch(`http://localhost:5000/cart?user_id=${user.id}`);
            const data = await res.json();
            setCart(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (isAuth && user?.id) {
            fetch(`http://localhost:5000/cart?user_id=${user.id}`)
                .then(res => res.json())
                .then(data => setCart(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isAuth, user?.id]);
    const filterref = useRef(null);
    return (
        <header>
            <div className="logo">
                <Link to="/">
                    <img src={`/svg/logo_${theme}.svg`} alt="Logo" style={{ width: "120px" }} />
                </Link>
            </div>

            <div className="menu_container">

                {menuOpen && (
                    <div ref={menuRef}>
                        <Log_in
                            isAuth={isAuth}
                            onClose={() => setMenuOpen(false)}
                            onLogin={handleLogin}
                            onRegister={handleRegister}
                            onLogout={handleLogout}
                            authError={authError}
                        />
                    </div>
                )}

                <button onClick={changeLang} className="but_lang">
                    {lang}
                </button>

                <button onClick={changeTheme} className="but_lang">
                    <img src={`svg/${theme}.svg`}></img>
                </button>

                <button>

                    <NavLink to={user?.role === "admin" ? "/admin/cart" : "/cart"} className="cart-link">
                        <img src="/svg/cart.svg" alt="cart" />
                        {user?.role != "admin" && cartItemsCount > 0 && (
                            <span className="cart-badge">{cartItemsCount}</span>
                        )}
                    </NavLink>

                </button>

                <button
                    className="profile-btn"
                    ref={btnRef}
                    onClick={toggleMenu}
                >
                    {isAuth ? (
                        <img src="/img/users/admin.svg" alt="admin" />
                    ) : (
                        <img src="/svg/profile.svg" alt="profile" />
                    )}
                </button>

            </div>

            <div className="post_menu">
                <NavLink to="/">{translator.subheaders?.[lang].Events}</NavLink>
                <NavLink to="/performers">{translator.subheaders?.[lang].Organizations}</NavLink>
            </div>

        </header>
    );
}
