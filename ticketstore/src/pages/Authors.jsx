import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Loading from "./Loading";

import "../pages/css/author.css"

export default function Authors() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/authors')
            .then(res => {
                if (!res.ok) return <NotFound />;
                return res.json();
            })
            .then(data => {
                setAuthors(data);
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
                {authors.map(author => (
                    <div key={author.id} className="author_section">
                        <NavLink to={`/author/details/${author.id}`}>
                            <div className="photo">
                                <img
                                    src={author.photo
                                        ? `/img/authors/${author.photo}`
                                        : '/img/authors/default.png'}
                                    alt={`${author.first_name} ${author.last_name}`}
                                />
                                <div className="overlay">
                                    {author.first_name} {author.last_name}
                                </div>
                            </div>
                        </NavLink>
                    </div>
                ))}
            </div>
        </div>
    );



}