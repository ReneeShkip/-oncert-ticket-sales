import { useParams, NavLink, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../pages/css/details.css";
import Alert from "../components/alert";
import { normalizeBook } from "../utils/normalizebooks";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { CartContext } from "../context/CartContext";
import Loading from "./Loading";


export default function BookDetails() {
    const { user } = useContext(UserContext);
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [coments, setComents] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [Characters, setCharacterstsOpen] = useState(true);
    const [Coments, setCommentsOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [theText, setText] = useState("");
    const [bookType, setBookTypeId] = useState(null);
    const [avType, setAvType] = useState(false);
    const [error, setError] = useState("");
    const stars = [1, 2, 3, 4, 5];
    const full = "/svg/star_full.svg";
    const empty = "/svg/star_empty.svg";

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const [caption, setCaption] = useState("")

    const { addToCart } = useContext(CartContext);

    const handleAddToCart = () => {
        if (!bookType) {
            setText("Оберіть тип книги");
            setShowAlert(true);
            return;
        }
        if (!user) {
            setText("Щоб купити книгу, увійдіть на сайт");
            setShowAlert(true);
            return;
        }
        addToCart(bookType, 1);
    };

    const fetchComs = async () => {
        try {
            const res = await fetch(
                `http://localhost:5000/comments/${id}`
            );

            if (!res.ok) throw new Error("Failed to fetch comments");

            const data = await res.json();
            setComents(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (user === null) {
            setErrorMessage("Для того, щоб залишити відгук, ви маєте бути авторизованим")
            return
        }
        const body = {
            user_id: user.id,
            book_id: book.id,
            caption,
            sub_rate: rating,
            date_post: new Date().toISOString()
        };

        try {
            const res = await fetch("http://localhost:5000/new_comm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Failed to post comment");

            const data = await res.json();
            setCaption("");
            setRating(0);
            fetchComs();

        } catch (err) {
            console.error(err);
        }
    };

    function TextMore({ text }) {
        const [expanded, setExpanded] = useState(false);
        const lim = 200;
        const isLong = text.length > lim;
        const displaytext = expanded ? text : text.slice(0, lim);

        return (
            <p>
                {displaytext}
                {isLong && !expanded && "..."}
                {isLong && (
                    <button onClick={() => setExpanded(!expanded)} className="morebtn">
                        {expanded ? "менше" : "більше"}
                    </button>
                )}
            </p>
        );
    }
    const limit = 2;
    const offset = 0;

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/authors_books?book_id=${id}&limit=${limit}&offset=${offset}`
                );

                if (res.status === 404) {
                    navigate("/404");
                    return;
                }

                if (!res.ok) throw new Error("Failed to fetch books");

                const data = await res.json();

                if (!data || data.length === 0) {
                    navigate("/404");
                    return;
                }

                setBook(normalizeBook(data));
            } catch (err) {
                console.error(err);
                navigate("/404");
            }
        };

        fetchData();
        fetchComs();
    }, [id]);

    if (loading) return <Loading />;
    if (!book) return <h2>Book not found</h2>;
    const hasAvailabile = book.types.some(t => t.availability === "Є")

    const total = coments.reduce((sum, coments) => sum + coments.sub_rate, 0);
    const avg = coments.length
        ? (total / coments.length).toFixed(1)
        : "5.0";

    const cancel = () => {
        setShowAlert(false);
    };

    return (
        <div className="author-details">
            {showAlert && <Alert
                text={theText}
                onConfirm={null}
                onCancel={cancel}
            />}
            <div className="book-container">
                <img src={`/img/covers/${book.cover}`} alt={book.title} className="book_cover" />
                <div className="for_stars">
                    {stars.map((star) => (
                        <img
                            key={`total_${star}`}
                            className="staar"
                            src={
                                avg > 0 ?
                                    avg >= star
                                        ? "/svg/star_full.svg"
                                        : avg + 0.5 >= star
                                            ? "/svg/star_half.svg"
                                            : "/svg/star_empty.svg"
                                    : "/svg/star_full.svg"

                            }
                            alt="star"
                        />

                    ))}
                    <div className="star_num">
                        {avg}
                    </div>
                </div>
            </div>
            <ul className="types">
                <button
                    className="buying"
                    disabled={!bookType}
                    onClick={handleAddToCart}
                >Купити</button>
                <div style={{ fontSize: "20px", color: "#68676a", margin: "0" }}>{!bookType && "Оберіть тип книги"}</div>
                {book.types.map((t) => (
                    <li key={t.book_type_id} className="type_item">
                        <label>
                            <input
                                name="type"
                                type="radio"
                                value={t.type_id}
                                className="hidden_checkbox"
                                disabled={t.availability == "Нема"}
                                onChange={() => setBookTypeId(t.book_type_id)}
                            />
                            <div className="checkbox_button">
                                <div>{t.type}</div>
                                {t.availability == "Нема" ?
                                    <div> <h4>Нема в наявності</h4></div>
                                    :
                                    <div>{t.price} грн</div>
                                }

                            </div>
                        </label>
                    </li>
                ))}
            </ul>

            <div className="info">
                <h1>{book.title}</h1>
                <TextMore text={book.annotation} />
                <div className="menu">
                    <button className={`button_click ${Characters}`} onClick={() => {
                        setCharacterstsOpen(true);
                        setCommentsOpen(false);
                    }}>Характеристики</button>
                    <button className={`button_click ${Coments}`} onClick={() => {
                        setCharacterstsOpen(false);
                        setCommentsOpen(true);
                    }}>Коментарі</button>
                </div>
                {Characters && (
                    <div className="second_info">
                        <ul className="books" key="books">
                            <li className="option_book">
                                <NavLink to={`/author/details/${book.author.id}`}>
                                    <div className="au_short_info">Автор</div>
                                    <div className="au_short_info" style={{ color: "#254C69" }}>
                                        {book.author.first_name} {book.author.last_name}
                                    </div>
                                </NavLink>
                            </li>

                            <li className="option_book">
                                <div className="au_short_info">Рік</div>
                                <div className="au_short_info">{book.year}</div>
                            </li>

                            <li className="option_book">
                                <div className="au_short_info">Видавництво</div>
                                <div className="au_short_info">{book.publisher}</div>
                            </li>

                            <li className="option_book">
                                <div className="au_short_info">Мова</div>
                                <div className="au_short_info">{book.language}</div>
                            </li>
                        </ul>
                    </div>
                )}
                {Coments && (
                    <div className="second_info">
                        <ul className="coments_ul">
                            {coments.length === 0 && (
                                <li className="nocom">Наразі немає коментарів</li>
                            )}

                            {coments.map((c, index) => {
                                const formatted = new Date(c.date_post).toLocaleDateString("uk-UA");
                                return (
                                    <li className="top_coms" key={`${c.id}_${index}`}>
                                        <div className="comentator">
                                            <div className="com_log">{c.login}</div>
                                            {stars.map((star) => (
                                                <img
                                                    key={`star_${c.id}_${star}`}
                                                    className="staar"
                                                    src={
                                                        c.sub_rate >= star
                                                            ? "/svg/star_full.svg"
                                                            : "/svg/star_empty.svg"
                                                    }
                                                    alt="star"
                                                />
                                            ))}
                                            <div className="date">{formatted}</div>
                                        </div>
                                        <div className="coments">
                                            {c.caption}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        <form className="sender" onSubmit={handleSubmit}>
                            <div className="all-in">
                                <h2>Ваша оцінка:</h2>
                                {stars.map((star) => (
                                    <img
                                        key={`new_star_${star}`}
                                        className="staar"
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(star)}
                                        src={star <= (hover || rating) ? full : empty}
                                        alt="star rating"
                                    />
                                ))}
                            </div>
                            <textarea
                                placeholder="Додати коментар..."
                                className="coments new_coms"
                                id="com_new"
                                rows={1}
                                maxLength={300}
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                            <button className="send" disabled={!caption.trim() || rating === 0} type="submit">
                                Надіслати
                            </button>
                            {errorMessage && (
                                <div className="error-message">
                                    {errorMessage}
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
