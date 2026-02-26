import { useState, useEffect } from "react";
import { normalizePublisher } from "../utils/normalizedpublisher";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import Loading from "./Loading";

export default function Publisher_Details() {
    const [publisher, setPublisher] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/authors_books?PublisherId=${id}`);
                if (!res.ok) throw new Error("Failed to fetch books");
                const data = await res.json();

                if (data.length > 0) {
                    setPublisher(normalizePublisher(data));
                } else {
                    if (!res.ok) throw new Error("Failed to fetch author");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (!publisher || loading) return <Loading />;
    return (
        <div className="author-details">
            <img src={`/img/publishers/${publisher.logo}`} alt="" />
            <div className="info">
                <h1>{publisher.name}</h1>
                {publisher.books.length > 0 && (
                    <div className="books">
                        <h2>Твори цього автора</h2>
                        <ul className="listbook">
                            {publisher.books.map(book => (
                                <li className="option_book" key={book.id}>
                                    <div className="au_short_info">{book.title}</div>
                                    <div className="au_short_info" key={0}>
                                        {book.types.map(btype => (
                                            <NavLink
                                                key={btype.book_type_id}
                                                to={`/book/details/${btype.book_type_id}`}
                                            >
                                                <div className="au_short_info">
                                                    {btype.type}
                                                </div>
                                            </NavLink>
                                        ))}
                                    </div>
                                    <div className="au_short_info">{book.year}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div >
    )
}