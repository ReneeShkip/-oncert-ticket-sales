import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import Log_in from "./Log_in";
import Subfilters from "./subfilters";
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { CartContext } from "../context/CartContext";

export default function Header() {
    const { user, isAuth, handleLogin, handleRegister, handleLogout, authError } = useContext(UserContext);
    const { cartItemsCount } = useContext(CartContext);
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchBoxRef = useRef(null);
    const searchToggleRef = useRef(null);
    const searchInputRef = useRef(null);
    const filterref = useRef(null);
    const menuRef = useRef(null);
    const btnRef = useRef(null);

    function applySearch() {
        navigate("/books/searched", { state: { searchText } });
    }
    const toggleMenu = () => setMenuOpen(prev => !prev);

    useEffect(() => {
        if (!searchOpen) return;

        searchInputRef.current?.focus();

        const handleClickOutside = (e) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(e.target) &&
                searchToggleRef.current &&
                !searchToggleRef.current.contains(e.target)
            ) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);

    }, [searchOpen]);

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

    const [filters, setFilters] = useState({
        genres: [],
        langs: [],
        types: [],
        price: {
            min: "",
            max: ""
        }
    });


    useEffect(() => {
        if (isAuth && user?.id) {
            fetch(`http://localhost:5000/cart?user_id=${user.id}`)
                .then(res => res.json())
                .then(data => setCart(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isAuth, user?.id]);

    return (
        <header>
            <div className="logo">
                <Link to="/">
                    <img src="/svg/logo.svg" alt="Logo" style={{ width: "120px" }} />
                </Link>
            </div>

            <div className="menu_container">

                <div className="search-wrapper">
                    <div
                        ref={searchBoxRef}
                        className={`search-box ${searchOpen ? "open" : ""}`}
                    >
                        <input
                            className="inputs"
                            type="text"
                            placeholder="Пошук..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button
                            className="close-search"
                            onClick={() => {
                                setSearchText("");
                                setSearchRes([]);
                                setSearchOpen(false);
                            }}
                        >
                            &times;
                        </button>
                    </div>

                    <button
                        ref={searchToggleRef}
                        className="search-toggle"
                        onClick={() => { !searchOpen ? setSearchOpen(true) : applySearch() }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                applySearch();
                            }
                        }}
                    >
                        <img src="/svg/search.svg" alt="search" />
                    </button>
                </div>

                <button
                    className="filter-toggle"
                    onClick={() => setFilterOpen(prev => !prev)}
                >
                    <img src="/svg/filter.svg" alt="filter" />
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

                {filterOpen && (
                    <div ref={filterref}>
                        <Subfilters onClose={() => setFilterOpen(false)}
                            filters={filters}
                            setFilters={setFilters} />
                    </div>
                )}
            </div>

            <div className="post_menu">
                <NavLink to="/">Каталог</NavLink>
                <NavLink to="/authors">Автори</NavLink>
                <NavLink to="/publishers">Видавництва</NavLink>
            </div>

        </header>
    );
}