import { useEffect, useState } from "react";
import './css/style.css';
import './css/catalog.css';
import Loading from "./Loading";

export default function Catalog() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/tickets')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch categories');
                return res.json();
            })
            .then(data => {
                setCategories(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading categories:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <Loading />;

    if (error) {
        return <div className="main-page">Помилка: {error}</div>;
    }

    return (
        <div className="main-page">
            {categories.map(c => (
                c.title
            ))}
        </div>
    );
}
