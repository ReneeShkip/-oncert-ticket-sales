import { useEffect, useState } from "react";
import "../pages/css/publisher.css"
import { NavLink } from "react-router-dom";
import Loading from "./Loading";


export default function Publishers() {
    const [publ, setPubl] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/publishers')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch publishers');
                return res.json();
            })
            .then(data => {
                setPubl(data);
                setLoading(false);
            })
            .catch(err => {
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
            <div className="publishers_page">
                {publ.map((item) => (
                    <div className="logotype" key={item.ID}>
                        <NavLink to={`/publisher/details/${item.ID}`}>
                            <img
                                src={`/img/publishers/${item.photo}`}
                                alt={item.name}
                            /></NavLink>
                        <div className="overlay"></div>
                    </div>

                ))}

            </div>

        </div>
    )
}
