import "../pages/css/filters.css"
import { useNavigate } from "react-router-dom";
import { MoreContext } from "../context/MoreContext";
import { useEffect, useState, useRef, useContext } from "react";
import NotFound from "../pages/notfound";


export default function Subfilters({ filters, setFilters }) {
    const { lang, theme } = useContext(MoreContext);
    const navigate = useNavigate();

    const [genres, setGenres] = useState([]);
    const genreref = useRef(null);
    const [genreOpen, setGenreOpen] = useState(false);

    const [types, setType] = useState([]);
    const typesref = useRef(null);
    const [typesOpen, setTypesOpen] = useState(false);

    const [country, setCountry] = useState([]);
    const countryref = useRef(null);
    const [countryOpen, setCountryOpen] = useState(false);


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
                countryref.current &&
                !countryref.current.contains(e.target)
            ) {
                setCountryOpen(false);
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
        fetch(`http://localhost:5000/country`)
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
                    setCountry(data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const translator = {
        ukr: {
            genres: "Жанри",
            types: "Типи події",
            country: "Міста"
        },
        eng: {
            genres: "Genres",
            types: "Event types",
            country: "Cities"
        }
    }

    const columns = Math.ceil(Math.sqrt(genres.length));
    const matrix = [];

    for (let i = 0; i < genres.length; i += columns) {
        matrix.push(genres.slice(i, i + columns));
    }

    return (
        <div className="filter-popup">
            {filters.length === 0 ?
                (
                    <div>Фільтри не знайдено</div>
                )
                :
                (
                    <div className="filters_matrix">
                        <ul className="filters_row">
                            <li className="filter_item" key="option_genre"
                                onClick={() => setGenreOpen(prev => !prev)}>
                                {translator?.[lang].genres}
                            </li>
                            <li className="filter_item" key="option_type"
                                onClick={() => setTypesOpen(prev => !prev)}>
                                {translator?.[lang].types}
                            </li>
                            <li className="filter_item" key="option_country"
                                onClick={() => setCountryOpen(prev => !prev)}>
                                {translator?.[lang].country}
                            </li>
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
                                                                checked={filters.genres.includes(genre.ID)}
                                                                onChange={(e) =>
                                                                    handleCheckboxChange("genres", genre.ID, e.target.checked)
                                                                } />
                                                            <span className="genres_item">
                                                                {genre[`genre_${lang}`]}
                                                            </span>
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
                                <div onClose={() => setTypesOpen(false)}>
                                    <div className="matrix list">
                                        {types.map(type => (
                                            <li key={type.id} className="type_list">
                                                <label className="checkbox_label">
                                                    <input name="type" type="checkbox"
                                                        value={type.type}
                                                        className="hidden_checkbox"
                                                        checked={filters.types.includes(type.ID)}
                                                        onChange={(e) =>
                                                            handleCheckboxChange("types", type.ID, e.target.checked)
                                                        } />
                                                    <span className="genres_item">
                                                        {type[`type_${lang}`]}
                                                    </span>
                                                </label>
                                            </li>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {countryOpen && (
                            <div ref={countryref}>
                                <div onClose={() => setCountryOpen(false)}>
                                    <div className="matrix llister">
                                        {country.map(c => (
                                            <li key={c.id} className="type_list">
                                                <label className="checkbox_label">
                                                    <input name="genres" type="checkbox"
                                                        value={c.name}
                                                        key={`country_${c.id}`}
                                                        className="hidden_checkbox"
                                                        checked={filters.country.includes(c.ID)}
                                                        onChange={(e) =>
                                                            handleCheckboxChange("country", c.ID, e.target.checked)
                                                        } />
                                                    <span className="genres_item">
                                                        {c[`name_${lang}`]}
                                                    </span>
                                                </label>
                                            </li>
                                        ))}
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