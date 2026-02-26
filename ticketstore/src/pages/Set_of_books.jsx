import { useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import "../pages/css/filtered_books.css"

export default function SetBooks() {
    const { state } = useLocation();
    const mode = state?.mode;
    const filters = state?.filters;
    const searchText = state?.searchText;
    const { category } = useParams();
    const [allbooks, setAllBooks] = useState([]);
    const [sortBy, setSortBy] = useState("");


    useEffect(() => {
        fetch(`http://localhost:5000/books?category=${category}&limit=1000&offset=0`)
            .then(res => {
                if (res.status === 404) {
                    return <NotFound />
                }
                if (!res.ok) {
                    throw new Error("Server error");
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setAllBooks(data);
                }
            })
            .catch(err => console.error(err));
    }, [category]);



    useEffect(() => {
        if (!mode || category) return;

        const params = new URLSearchParams();

        if (mode === "search") {
            const query = state?.q || searchText;
            if (!query?.trim()) return;

            params.set("search", "true");
            params.set("q", query);
        }

        if (mode === "filters" && filters) {
            if (filters.genres?.length) params.set("genres", filters.genres.join(","));
            if (filters.types?.length) params.set("types", filters.types.join(","));
            if (filters.langs?.length) params.set("langs", filters.langs.join(","));
            if (filters.price?.min) params.set("minPrice", filters.price.min);
            if (filters.price?.max) params.set("maxPrice", filters.price.max);
        }

        const url = `http://localhost:5000/filteredbooks?${params.toString()}`;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setAllBooks(data);
            })
            .catch(err => {
                console.error("Fetch error:", err);
            });

    }, [mode, state?.q, searchText, filters]);

    const sortedBooks = [...allbooks].sort((a, b) => {
        if (sortBy === "price") {
            return a.price - b.price;
        }

        if (sortBy === "title") {
            return a.title.localeCompare(b.title, "uk");
        }

        if (sortBy === "availability") {
            return (b.availability === "Є") - (a.availability === "Є");
        }

        return 0;
    });

    return (
        <div className="child-page">
            <div className="sorting">
                <h4>Сортувати за</h4>
                <select id="lang" name="lang"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}>
                    <option value="">...</option>
                    <option value="price">ціною</option>
                    <option value="title">назвою</option>
                    <option value="availability">наявністю</option>
                </select>
            </div>
            <div className="books-page">
                <ul className="catalog_ul book_ul">
                    {sortedBooks.length > 0 ?
                        sortedBooks.map(book => (
                            <li
                                className="catalog_li book_li"
                                key={`${book.ID}`}
                            >
                                <div className={book.availability === "Нема" ? "dis" : ""}>
                                    <NavLink to={`/book/details/${book.ID}`}>
                                        <img
                                            src={`/img/covers/${book.cover}`}
                                            alt={book.title}
                                            className={`book-cover ${book.type}`}
                                        />
                                        <div className="short_info">{book.title}</div>
                                        <div className="short_info">
                                            {book.price} грн
                                        </div>
                                    </NavLink>
                                </div>
                            </li>
                        ))
                        :
                        <div><p>За вашим запитом нічого не знайдено</p></div>}
                </ul>
            </div>
        </div>
    );
}
