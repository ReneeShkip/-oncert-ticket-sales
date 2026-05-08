import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { NavLink } from "react-router-dom";
import Loading from "./Loading";
import { MoreContext } from "../context/MoreContext";
import { usePerformers } from "../context/AuthorContext";
import { UserContext } from "../context/UserContext";

import "../pages/css/author.css"

export default function Performers() {
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { lang, theme } = useContext(MoreContext);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const searchBoxRef = useRef(null);
    const searchToggleRef = useRef(null);
    const searchInputRef = useRef(null);
    const translator = {
        ukr: {
            performers: "Виконавці",
            wanter: "Хочу стати виконавцем"
        },
        eng:
        {
            performers: "Performers",
            wanter: "I want to become a performer"
        }
    }

    const [perfomers, setPerfomers] = useState([]);

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
        fetch('http://localhost:5000/organizations')
            .then(res => {
                if (!res.ok) return <NotFound />;
                return res.json();
            })
            .then(data => {
                setPerfomers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading authors:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const [searchRes, setSearchRes] = useState([]);

    const applySearch = () => {
        const result = perfomers.filter(p => {
            const searchLower = searchText.toLowerCase();
            return p?.name_ukr?.toLowerCase().includes(searchLower) ||
                p?.name_eng?.toLowerCase().includes(searchLower) ||
                p?.biography_ukr?.toLowerCase().includes(searchLower) ||
                p?.biography_eng?.toLowerCase().includes(searchLower);
        });
        setSearchRes(result);
    };

    const filteredperfomers = useMemo(() => {
        let result = [...perfomers];

        if (searchRes.length > 0) {
            result = result.filter(e => searchRes.some(s => s.ID === e.ID));
        }

        return result;
    }, [perfomers, searchRes]);

    if (loading) return <Loading />;

    if (error) {
        return <div className="child-page">Помилка: {error}</div>;
    }

    console.log(filteredperfomers);

    return (
        <div className="child-page"><h1>{translator?.[lang].performers}</h1>
            <div className="noticers">
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
                    <div>
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
                            <img src={`/svg/search_${theme}.svg`} alt="search" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="authors_page">

                {filteredperfomers.map(p => (
                    <div key={p.ID} className="author_section">
                        <NavLink to={`/performers/details/${p.ID}`}>
                            <div className="photo">
                                <img
                                    src={p.photo
                                        ? `/img/covers/${p.photo}`
                                        : '/img/authors/default.png'}
                                    alt={p[`name_${lang}`]}
                                />
                                <div className="overlay">
                                    {p[`name_${lang}`]}
                                </div>
                            </div>
                        </NavLink>
                    </div>
                ))}
            </div>
            {user && user.role != "admin" &&
                <NavLink to={`/form-cooperation`} className="linker">{translator?.[lang].wanter}</NavLink>
            }
        </div>
    );
}
