import { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import Loading from "./Loading";
import { MoreContext } from "../context/MoreContext";
import { usePerformers } from "../context/AuthorContext";


import "../pages/css/author.css"

export default function Performers() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { lang, theme } = useContext(MoreContext);

    const [perfomers, setPerfomers] = useState([]);

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

    if (loading) return <Loading />;

    if (error) {
        return <div className="child-page">Помилка: {error}</div>;
    }

    return (
        <div className="child-page">
            <div className="authors_page">
                {perfomers.map(p => (
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
        </div>
    );
}