import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { normalizeAuthor } from "../utils/normalizedauthors";
import { NavLink } from "react-router-dom";
import Loading from "./Loading";
import { useContext } from "react";
import { useEvents } from "../context/EventContext";
import { MoreContext } from "../context/MoreContext";
import "../pages/css/details.css";
import { usePerformers } from "../context/AuthorContext";

export default function PerformerDetails() {
    const { id } = useParams();
    const { events } = useEvents();
    const performerEvents = events.filter(e =>
        e.organizations.some(e => String(e.id) === String(id))
    );
    const { authors, loading, error } = usePerformers();
    const performer = authors.find(e => String(e.id) === String(id));
    console.log("authors", authors);
    const { lang, theme } = useContext(MoreContext);
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

    const translator = {
        ukr: {
            Eventer: "Події цього виконавця",
            Soc: "Соц. мережі"
        },
        eng: {
            Eventer: "Events by this artist",
            Soc: "Social networks"
        }
    }

    if (loading) return <Loading />;
    if (!performer) return <h2>Performer not found</h2>;
    return (
        <div className="author-details">
            <div className="book-container">
                <div className="overlay">
                </div>
                <img src={`/img/covers/${performer.photo}`} alt="photo" className="bg-blur" />
                <img src={`/img/covers/${performer.photo}`} alt="photo" className="book_cover" />
            </div>
            <div className="info">
                <h1>{performer.first_name}</h1>
                <TextMore text={performer?.[lang].biography} />
                {performer.events.length > 0 && (
                    <div className="books">
                        <div className="soc">

                            {performer.links ? (
                                <a href={performer.links} className="au_short_info link">
                                    <div className="link_container">{translator?.[lang].Soc}
                                        <img src={`/svg/linker_svg_${theme}.svg`} alt="link" className="link" />
                                    </div>
                                </a>
                            ) : null}
                        </div>
                        <h2>{translator?.[lang].Eventer}</h2>
                        <ul className="listbook">
                            {performerEvents.map(event => (
                                <li className="option_book" key={event.id}>
                                    <div className="au_short_info" key={0}>

                                        <NavLink
                                            key={event.id}
                                            to={`/event/details/${event.id}`}
                                        >
                                            <div className="au_short_info">{event?.[lang].title}</div>
                                        </NavLink>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div >
    )
}
