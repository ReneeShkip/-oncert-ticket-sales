import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import './css/style.css';
import './css/catalog.css';
import Loading from "./Loading";
import { MoreContext } from "../context/MoreContext";
import Subfilters from "../components/Subfilters";

function generateCalendar(year, month) {

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();


    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = (firstDay + 6) % 7;

    const calendar = [];

    for (let i = startOffset; i > 0; i--) {
        calendar.push({
            day: daysInPrevMonth - i + 1,
            currentMonth: false
        });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        calendar.push({
            day: day,
            currentMonth: true
        });
    }

    let nextMonthDay = 1;
    while (calendar.length < 42) {
        calendar.push({
            day: nextMonthDay++,
            currentMonth: false
        });
    }

    return calendar;
}


export default function Catalog() {
    const { events, loading, error } = useEvents();
    const { lang, theme } = useContext(MoreContext);
    const [filters, setFilters] = useState({
        genres: [],
        langs: [],
        types: [],
        country: []
    });

    const filteredEvents = useMemo(() => {
        let result = [...events];

        if (filters.genres.length > 0) {
            result = result.filter(e =>
                e.genres.some(g => filters.genres.includes(g.id))
            );
        }

        if (filters.types.length > 0) {
            result = result.filter(e =>
                e.organizations.some(o => filters.types.includes(o.type_id))
            );
        }

        if (filters.country.length > 0) {
            result = result.filter(e =>
                e.tickets.some(o => filters.country.includes(o.location.country_id))
            );
        }

        return result;
    }, [events, filters]);

    const [filterOpen, setFilterOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filterClosing, setFilterClosing] = useState(false);
    const searchBoxRef = useRef(null);
    const searchToggleRef = useRef(null);
    const searchInputRef = useRef(null);

    function applySearch() {
        navigate("/books/searched", { state: { searchText } });
    }

    useEffect(() => {
        if (!searchOpen) return;

        searchInputRef.current?.focus();

        const handleClickOutside = (e) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(e.target) &&
                searchToggleRef.current &&
                !searchToggleRef.current.contains(e.target)
            ) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);

    }, [searchOpen]);

    useEffect(() => {
        if (!filterOpen) return;

        const handleClickOutside = (e) => {
            if (
                filterref.current &&
                !filterref.current.contains(e.target)
            ) {
                setFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [filterOpen]);

    const filterref = useRef(null);
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const [country, setCountry] = useState(null);
    const [type, setType] = useState(null);
    const [calendar, setCalendar] = useState(
        generateCalendar(year, month)
    );
    const [info, setInfo] = useState([]);

    useEffect(() => {
        setCalendar(generateCalendar(year, month));
    }, [year, month]);

    if (loading) return <Loading />;

    { error && <div className="main-page">Помилка: {error}</div> }
    const translator = {
        ukr: {
            infobtn_more: "Детальніше",
            info_prev: "Оберіть дату, що вас цікавить. Якщо дата не виділена - подій цього дня нема.",
            month_name: new Intl.DateTimeFormat("uk-UA", {
                month: "long"
            }).format(new Date(year, month))
        },
        eng: {
            infobtn_more: "More",
            info_prev: "Select the date you are interested in. If the date is not highlighted, there are no events on that day.",
            month_name: new Intl.DateTimeFormat("en-En", {
                month: "long"
            }).format(new Date(year, month))
        },
    }

    return (
        <div className="catalog_container">
            <div className="noticers">
                <div className="search-wrapper">
                    <div
                        ref={searchBoxRef}
                        className={`search-box ${searchOpen ? "open" : ""}`}
                    >
                        <input
                            className="inputs"
                            type="text"
                            placeholder="Пошук..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button
                            className="close-search"
                            onClick={() => {
                                setSearchText("");
                                setSearchRes([]);
                                setSearchOpen(false);
                            }}
                        >
                            &times;
                        </button>

                    </div>
                    <button
                        ref={searchToggleRef}
                        className="search-toggle"
                        onClick={() => { !searchOpen ? setSearchOpen(true) : applySearch() }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                applySearch();
                            }
                        }}
                    >
                        <img src={`/svg/search_${theme}.svg`} alt="search" />
                    </button>
                </div>
                <button
                    className="filter-toggle"
                    onClick={() => setFilterOpen(prev => !prev)}
                >
                    <img src={`/svg/filters_${theme}.svg`} alt="filter" />


                    {filterOpen && (
                        <Subfilters onClose={() => setFilterOpen(false)}
                            filters={filters}
                            setFilters={setFilters} />
                    )}
                </button>

            </div>
            <div className="catalog_page">
                <div className="calendar">
                    <div className="calendar-header">
                        <button className="prev-next" onClick={() => {
                            if (month === 0) {
                                setMonth(11);
                                setYear(year - 1);
                            } else {
                                setMonth(month - 1);
                            }
                        }}>
                            <img src={`svg/prev_${theme}.svg`} alt="prev" />
                        </button>
                        {translator?.[lang]?.month_name}, {year}
                        <button className="prev-next" onClick={() => {
                            if (month === 11) {
                                setMonth(0);
                                setYear(year + 1);
                            } else {
                                setMonth(month + 1);
                            }
                        }}>
                            <img src={`svg/next_${theme}.svg`} alt="next" />
                        </button>
                    </div>
                    <div className="dates-container">
                        {calendar.map(d => {
                            const ticketEvent = d.currentMonth ? filteredEvents.filter(e =>
                                e.tickets.some(t => {
                                    const eventDate = new Date(t.date);
                                    return eventDate.getFullYear() === year &&
                                        eventDate.getMonth() === month &&
                                        eventDate.getDate() === d.day;
                                })
                            ) : [];

                            return (
                                <button
                                    key={`day_${year}_${month}_${d.day}_${d.currentMonth}`}
                                    className={`the_date_${d.currentMonth} ${ticketEvent.length > 0 ? "isEvent" : ""}`}
                                    disabled={!d.currentMonth}
                                    onClick={() => setInfo(ticketEvent)}
                                >
                                    {d.day}
                                </button>
                            );
                        })}
                    </div>
                </div >
                <div className="events">
                    {info.length > 0 ? (
                        info.map((event, idx) => {
                            return (
                                <NavLink to={`/event/details/${event.id}`} className="more_info">
                                    <img className="bg-blur info_bg" src={`img/covers/${event.cover}`} alt={event?.[lang]?.title} />
                                    <div key={idx} className="event_info">
                                        <div className="event_info_text">
                                            <h2>{event?.[lang]?.title || "Без назви"}</h2>
                                        </div>
                                        <img src={`img/covers/${event.cover}`} alt={event?.[lang]?.title} className="event_cover" />
                                    </div>
                                </NavLink>
                            );
                        })
                    ) : (
                        <div className="event_info">
                            <p>{translator?.[lang]?.info_prev}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
