import "../pages/css/filters.css"
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";


export default function Subfilters({ filters, setFilters }) {

    const navigate = useNavigate();
    function applyFilters() {

        navigate("/books/filteredbooks", {
            state: {
                mode: "filters",
                filters: filters
            }
        });
    }

    const [genres, setGenres] = useState([]);
    const genreref = useRef(null);
    const [genreOpen, setGenreOpen] = useState(false);

    const [types, setType] = useState([]);
    const typesref = useRef(null);
    const [typesOpen, setTypesOpen] = useState(false);

    const [langs, setLang] = useState([]);
    const langsref = useRef(null);
    const [langsOpen, setLangsOpen] = useState(false);

    const [price, setPrice] = useState({ min: "", max: "" });
    const priceref = useRef(null);
    const [priceOpen, setPriceOpen] = useState(false);

    function handleCheckboxChange(category, value, isChecked) {
        setFilters(prev => {
            const current = prev[category] || [];

            return {
                ...prev,
                [category]: isChecked
                    ? [...current, value]
                    : current.filter(item => item !== value)
            };
        });
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                genreref.current &&
                !genreref.current.contains(e.target)
            ) {
                setGenreOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                typesref.current &&
                !typesref.current.contains(e.target)
            ) {
                setTypesOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                langsref.current &&
                !langsref.current.contains(e.target)
            ) {
                setLangsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                priceref.current &&
                !priceref.current.contains(e.target)
            ) {
                setGenreOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    useEffect(() => {
        fetch(`http://localhost:5000/genres`)
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
                    setGenres(data)
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5000/types`)
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
                    setType(data)
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetch(`http://localhost:5000/langs`)
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
                    setLang(data)
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (priceOpen && price.min && price.max) {
            setFilters(prev => ({
                ...prev,
                price: {
                    min: prev.price.min || price.min,
                    max: prev.price.max || price.max
                }
            }));
        }
    }, [priceOpen, price.min, price.max]);

    useEffect(() => {
        fetch(`http://localhost:5000/price`)
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
                    setPrice({
                        min: data[0].min,
                        max: data[0].max
                    });
                }
            })
            .catch(err => console.error(err));
    }, []);



    const columns = Math.ceil(Math.sqrt(genres.length));
    const matrix = [];

    for (let i = 0; i < genres.length; i += columns) {
        matrix.push(genres.slice(i, i + columns));
    }

    return (
        <div className="filter-popup">
            {genres.length === 0 ?
                (
                    <div>Фільтри не знайдено</div>
                )
                :
                (
                    <div className="filters_matrix">
                        <ul className="filters_row">
                            <li className="filter_item"
                                onClick={() => setGenreOpen(prev => !prev)}>
                                Жанри
                            </li>
                            <li className="filter_item"
                                onClick={() => setLangsOpen(prev => !prev)}>
                                Мова
                            </li>
                            <li className="filter_item"
                                onClick={() => setTypesOpen(prev => !prev)}>
                                Тип книги
                            </li>
                            <li className="filter_item"
                                onClick={() => setPriceOpen(prev => !prev)}>
                                Ціна
                            </li>
                            <button className="button_item" onClick={applyFilters}>
                                Застосувати
                            </button>
                        </ul>
                        {genreOpen && (
                            <div ref={genreref}>
                                <div onClose={() => setGenreOpen(false)}>
                                    <div className="matrix genlist">
                                        {matrix.map((row, rowIndex) => (
                                            <ul key={rowIndex} className="genres_row">
                                                {row.map(genre => (
                                                    <li key={genre.id}>
                                                        <label className="checkbox_label">
                                                            <input
                                                                name="genres" type="checkbox"
                                                                value={genre.genre}
                                                                className="hidden_checkbox"
                                                                checked={filters.genres.includes(genre.id)}
                                                                onChange={(e) =>
                                                                    handleCheckboxChange("genres", genre.id, e.target.checked)
                                                                } />
                                                            <span className="genres_item">{genre.genre}</span >
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {typesOpen && (
                            <div ref={typesref}>
                                <div onClose={() => setGenreOpen(false)}>
                                    <div className="matrix list">
                                        {types.map(type => (
                                            <li key={type.id} className="type_list">
                                                <label className="checkbox_label">
                                                    <input name="genres" type="checkbox"
                                                        value={type.type}
                                                        className="hidden_checkbox"
                                                        checked={filters.types.includes(type.id)}
                                                        onChange={(e) =>
                                                            handleCheckboxChange("types", type.id, e.target.checked)
                                                        } />
                                                    <span className="genres_item">{type.type}</span >
                                                </label>
                                            </li>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {langsOpen && (
                            <div ref={langsref}>
                                <div onClose={() => setGenreOpen(false)}>
                                    <div className="matrix llister">
                                        {langs.map(lang => (
                                            <li key={lang.id} className="type_list">
                                                <label className="checkbox_label">
                                                    <input name="genres" type="checkbox"
                                                        value={lang.name}
                                                        className="hidden_checkbox"
                                                        checked={filters.langs.includes(lang.id)}
                                                        onChange={(e) =>
                                                            handleCheckboxChange("langs", lang.id, e.target.checked)
                                                        } />
                                                    <span className="genres_item">{lang.name}</span >
                                                </label>
                                            </li>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {priceOpen && (
                            <div ref={priceref}>
                                <div onClose={() => setPriceOpen(false)}>
                                    <div className="matrix lir">
                                        <input
                                            type="number"
                                            className="inputs"
                                            name="min_price"
                                            value={filters.price.min}
                                            min={price.min}
                                            max={price.max}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                setFilters(prev => ({
                                                    ...prev,
                                                    price: { ...prev.price, min: val }
                                                }))
                                            }}
                                            onBlur={() => {
                                                setFilters(prev => {
                                                    let val = Number(prev.price.min);
                                                    let maxval = Number(prev.price.max);

                                                    if (isNaN(val) || val < price.min) {
                                                        val = price.min;
                                                    }
                                                    if (val > price.max) {
                                                        val = price.max;
                                                    }
                                                    if (maxval < val) val = maxval;

                                                    return {
                                                        ...prev,
                                                        price: { ...prev.price, min: val }
                                                    }
                                                })
                                            }}
                                        /> -
                                        <input
                                            type="number"
                                            className="inputs"
                                            name="max_price"
                                            value={filters.price.max}
                                            min={price.min}
                                            max={price.max}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFilters(prev => ({
                                                    ...prev,
                                                    price: { ...prev.price, max: val }
                                                }));
                                            }}
                                            onBlur={() => {
                                                setFilters(prev => {
                                                    let val = Number(prev.price.max);
                                                    let minVal = Number(prev.price.min);

                                                    if (isNaN(val) || val > price.max) {
                                                        val = price.max;
                                                    }
                                                    if (val < price.min) {
                                                        val = price.min;
                                                    }
                                                    if (minVal > val) val = minVal;
                                                    return {
                                                        ...prev,
                                                        price: { ...prev.price, max: val }
                                                    };
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    )
}