import { useParams, NavLink, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../pages/css/details.css";
import Alert from "../components/alert";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { MoreContext } from "../context/MoreContext";
import { CartContext } from "../context/CartContext";
import { formatDate } from "../utils/formatDate";
import { useEvents } from "../context/EventContext";
import { usePerformers } from "../context/AuthorContext";
import Loading from "./Loading";

export default function EventDetails() {
    const { events, loading, error } = useEvents();
    const { user } = useContext(UserContext);
    const { id } = useParams();
    const { lang, theme } = useContext(MoreContext);
    const event = events.find(e => String(e.id) === String(id));
    const [Characters, setCharacterstsOpen] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [theText, setText] = useState("");
    const [dateId, setDateId] = useState(null);
    const { authors } = usePerformers();
    const eventAuthors = authors.filter(a =>
        a.events.some(e => String(e.id) === String(id))
    );

    const translator = {
        ukr: {
            check: "Забронювати",
            currency: "грн",
            more: "більше",
            less: "менше",
            modalText: "Ви не обрали дату події",
            modalSecondText: "Ви не авторизовані на сайті",
            afterBook: "Ви забронювали квиток! До його оплати у вас 15 хвилин, після чого бронювання буде скасовано"
        },
        eng: {
            check: "Reserve",
            currency: "uah",
            more: "more",
            less: "less",
            modalText: "You`ve not selected an event date",
            modalSecondText: "You are not logged in to the site",
            afterBook: "You`ve booked a ticket! You have 15 minutes to pay for it, after which the reservation will be canceled."
        }
    }

    const { addToCart } = useContext(CartContext);

    const handleAddToCart = () => {
        if (!dateId) {
            setText(translator?.[lang].modalText);
            setShowAlert(true);
            return;
        }
        if (!user) {
            setText(translator?.[lang].modalSecondText);
            setShowAlert(true);
            return;
        }
        addToCart(dateId, 1);
    };



    function TextMore({ text }) {
        const [expanded, setExpanded] = useState(false);
        const lim = 200;
        const isLong = text.length > lim;
        const displayText = expanded ? text : text.slice(0, lim);

        return (
            <p>
                {displayText.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                ))}
                {isLong && !expanded && "..."}
                {isLong && (
                    <button onClick={() => setExpanded(!expanded)} className="morebtn">
                        {expanded ? translator?.[lang].less : translator?.[lang].more}
                    </button>
                )}
            </p>
        );
    }

    if (loading) return <Loading />;
    if (!event) return <div>Подію не знайдено (id: {id})</div>;

    const cancel = () => {
        setShowAlert(false);
    };
    //console.log(event);
    return (
        <div className="author-details">
            {showAlert && <Alert
                text={theText}
                onConfirm={null}
                onCancel={cancel}
            />}
            <div className="book-container">
                <div className="overlay">
                    {Characters && (
                        <div className="info_container">
                            <div key="books" className="info_ul">
                                <div className="lister">
                                    <img src={`/svg/zakladka_${theme}.svg`} alt="" />
                                    {eventAuthors.map(a => (
                                        <NavLink key={a.id} to={`/performers/details/${a.id}`}>
                                            <div className="au_short_info">
                                                {a?.[lang]?.name}
                                            </div>
                                        </NavLink>
                                    ))}
                                </div>
                                <div key="books" className="lister">
                                    <img src={`/svg/zakladka_${theme}.svg`} alt="" />
                                    <div className="au_short_info">{event?.[lang].type}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <img src={`/img/covers/${event.cover}`} alt={event.title} className="bg-blur" />
                <img src={`/img/covers/${event.cover}`} alt={event.title} className="book_cover" />
            </div>
            <div className="genres_list">
                {event.genres.map(g =>
                    <div className="one_genre" key={g.id}>
                        {g?.[lang]}
                    </div>
                )}
            </div>
            <ul className="types">
                <li key="buttonBook" className="buttonBook">
                    <button
                        className="buying"
                        disabled={!event.tickets.some(t => t.quantity > 0)}
                        onClick={handleAddToCart}
                    >{translator?.[lang].check} <div>{event.price} {translator?.[lang].currency}</div></button>
                    {<div className="underbtn">{!dateId && "Оберіть дату"}</div>
                    }
                </li>
                {
                    event.tickets.map((t) => (
                        <li key={t.date_id} className="type_item">
                            <label>
                                <input
                                    name="type"
                                    type="radio"
                                    value={t.type_id}
                                    className="hidden_checkbox"
                                    disabled={t.quantity < 1}
                                    onChange={() => setDateId(t.date_id)}
                                />
                                <div className="checkbox_button">
                                    <h3>{t.location?.[lang].country}</h3>
                                    <h5>{t.location?.[lang].address}</h5>
                                    <div>{formatDate(t.date)}</div>
                                    {t.availability == "Нема" &&
                                        <div> <h4>Нема в наявності</h4></div>
                                    }

                                </div>
                            </label>
                        </li>
                    ))
                }
            </ul>

            <div className="info">
                <h1>{event?.[lang]?.title || "Без назви"}</h1>
                <TextMore text={event?.[lang]?.description} />
            </div>
        </div>
    );
}
