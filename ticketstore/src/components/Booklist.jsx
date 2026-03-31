import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import '../pages/css/style.css';
import '../App.css';
import '../pages/css/catalog.css';

export default function BooksList({ category, categoryName }) {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [error, setError] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [pageSize, setPageSize] = useState(getPageSize());
    function getPageSize() {
        const width = window.innerWidth;
        let p = 7
        if (width < 1200) p = 5;
        if (width < 940) p = 4;
        if (width < 570) p = 2;
        if (page === 2) p--;
        return p;
    }


    useEffect(() => {
        const onResize = () => {
            setPageSize(getPageSize());
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        setPageSize(getPageSize());
        fetch(
            `http://localhost:5000/books?category=${category}&limit=${pageSize}&offset=${page * pageSize}`
        )
            .then(res => {
                if (!res.ok) throw new Error("Server error");
                return res.json();
            })
            .then(data => {
                setBooks(data.slice(0, pageSize));
                setHasNextPage(data.length > pageSize - 1 && page < 2);
            })
            .catch(console.error);
    }, [page, category, pageSize]);

    useEffect(() => {
        setPage(0);
    }, [category]);

    useEffect(() => {

    }, [])

    const nextPage = () => setPage(prev => prev + 1);
    const prevPage = () => setPage(prev => Math.max(prev - 1, 0));

    if (error) {
        return <NotFound />;
    }

    return (
        <div className="catalog">

            <button onClick={prevPage} disabled={page === 0} className="nav-btn-prev">
                <img
                    src={page !== 0 ? "/svg/prev.svg" : "/svg/prev-dis.svg"}
                    alt="Назад"
                />
            </button>

            <div className="catalog_section">
                <div className="category">{categoryName || category}</div>

                {books.length === 0 ? (
                    <div>Книги не знайдено</div>
                ) : (
                    <>
                        <ul className="catalog_ul">
                            {books.map(book => (
                                <li
                                    className="catalog_li"
                                    key={`${category}_${book.ID}`}
                                >
                                    <NavLink to={`/book/details/${book.ID}`} className="navlink">
                                        <img
                                            src={`/img/covers/${book.cover}`}
                                            alt={book.title}
                                            className={`book-cover ${book.type}`}
                                        />
                                        <div className="overlay"></div>
                                        <div className="short_info">
                                            {book?.title?.length > 14
                                                ? book.title.slice(0, 14) + "..."
                                                : book?.title}
                                        </div>
                                        <div className="short_info">
                                            {book.price} грн
                                        </div>
                                    </NavLink>
                                </li>
                            ))}
                            {(!hasNextPage) && (
                                <NavLink to={`/books/filteredbooks/${category}`} className="show-more">
                                    Ще
                                </NavLink>

                            )}
                        </ul>
                    </>
                )}
            </div>

            <button onClick={nextPage} disabled={!hasNextPage} className="nav-btn-next">
                <img
                    src={hasNextPage ? "/svg/next.svg" : "/svg/next-dis.svg"}
                    alt="Вперед"
                />
            </button>
        </div>
    );
}
