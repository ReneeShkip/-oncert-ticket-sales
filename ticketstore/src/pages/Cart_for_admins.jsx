import { normalizeOrderStatuses } from "../utils/normalizedorderstatuses";
import { normalizedApplications } from "../utils/normalizedApplcations";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { EventContext } from "../context/EventContext";
import { CartContext } from "../context/CartContext";
import { MoreContext } from "../context/MoreContext";
import { usePerformers } from "../context/AuthorContext";
import { formatDate } from "../utils/formatDate"
import './css/profile.css';

export default function Cart_for_admins() {
    const { user } = useContext(UserContext);
    const { events } = useContext(EventContext);
    const [cart, setCart] = useState([]);
    const [table, setTable] = useState([]);
    const [dels, setDels] = useState([]);
    const { authors } = usePerformers();
    const [moreInfo, setMoreInfo] = useState({});
    const toggle = (id) => setMoreInfo(prev => ({ ...prev, [id]: !prev[id] }));
    const [moreOrder, setMoreOrder] = useState({});
    const toggleOrder = (id) => setMoreOrder(prev => ({ ...prev, [id]: !prev[id] }));
    const [moreSection, setMoreSection] = useState({});
    const toggleSection = (id) => setMoreSection(prev => ({ ...prev, [id]: !prev[id] }));
    const [moreCanceled, setMoreCanceled] = useState({});
    const toggleCanceled = (id) => setMoreCanceled(prev => ({ ...prev, [id]: !prev[id] }));
    const [more, setMore] = useState({});
    const toggleMore = (id) => setMore(prev => ({ ...prev, [id]: !prev[id] }));
    const [moreApplies, setMoreApplies] = useState({});
    const toggleApplies = (id) => setMoreApplies(prev => ({ ...prev, [id]: !prev[id] }));
    const [moreForm, setMoreForm] = useState({});
    const toggleForm = (id) => setMoreForm(prev => ({ ...prev, [id]: !prev[id] }));
    const { lang, theme } = useContext(MoreContext)
    const [moreApplication, setMoreApplication] = useState({});
    const toggleApplication = (id) => setMoreApplication(prev => ({ ...prev, [id]: !prev[id] }));

    const translator = {
        ukr: {
            sectionTickets: "Куплені квитки",
            sectionCanceled: "Скасовані події",
            sectionApplications: "Заявки на співпрацю",
            sectionDeleter: "Заявки на видалення",
            notError: "Ви не авторизовані"
        },
        eng: {
            sectionTickets: "Purchased tickets",
            sectionCanceled: "Cancelled events",
            sectionApplications: "Applications for cooperation",
            sectionDeleter: "Deletion Requests",
            notError: "You're not autorized"
        }
    }

    const fetchDeleter = () => {
        fetch("http://localhost:5000/delete_requests")
            .then(res => res.json())
            .then(data => {
                setDels(data);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchDeleter();
    }, []);

    useEffect(() => {
        fetch("http://localhost:5000/all_orders")
            .then(res => res.json())
            .then(data => {
                setCart(normalizeOrderStatuses(data));
            })

            .catch(console.error);
    }, []);

    useEffect(() => {
        fetch("http://localhost:5000/applications")
            .then(res => res.json())
            .then(data => {
                const normalized = normalizedApplications(data.applications, data.questions);
                setTable(normalized);
                console.log("normalized", normalized);
            })
            .catch(console.error);
    }, []);

    if (!user) {
        return (
            <div className="cart_page">
                <div className="alternative">
                    <img src="/svg/notAuth.svg" alt="not-auth" />
                    <h1>{translator?.[lang].notError}</h1>
                </div>
            </div>
        );
    }

    const rejectDelete = async (id) => {
        try {
            await fetch(`http://localhost:5000/reject_delete`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            fetchDeleter();
        } catch (err) {
            console.error(err);
        }
    };

    const approveDelete = async (id) => {
        console.log("approveDelete called with id:", id);
        try {
            await fetch(`http://localhost:5000/delete_performer?id=${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
        } catch (err) {
            console.error(err);
        }
    };

    const responce = async (id, isConfirmed) => {
        try {
            await fetch(`http://localhost:5000/responce`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isConfirmed })
            });

            fetch("http://localhost:5000/applications")
                .then(res => res.json())
                .then(data => {
                    const normalized = normalizedApplications(data.applications, data.questions);
                    setTable(normalized);
                });
        } catch (err) {
            console.error(err);
        }
    };

    const filterAndClean = (arr, nestedKey, fieldKey, targetValue) => {
        return arr
            .map(item => ({
                ...item,
                [nestedKey]: item[nestedKey].filter(nested => nested[fieldKey] === targetValue)
            }))
            .filter(item => item[nestedKey].length > 0);
    };

    const justCanceled = filterAndClean(events, "tickets", "status", "Скасовано")
    return (
        <div className="admin_cart">
            <div className="section_container">
                <div className="section_title">
                    <h1>{translator?.[lang].sectionTickets}</h1>
                    <button onClick={() => toggleSection(0)}>
                        <img src={theme === "dark" ? "/svg/down_blue.svg" : "/svg/down_red.svg"} alt="toggle" className={`arrow ${moreSection[0] ? "toggle" : ""}`} />
                    </button>
                </div>

                <div className={`details section_details ${!moreSection[0] ? "open" : ""}`}>
                    <div style={{ overflow: "hidden" }}>
                        {cart.map(user => (
                            <div key={user.id} className="order_for_admin">
                                <div className="user_info">
                                    <div className={`order-date ${user.id === 23 && `deleted`}`}>
                                        <h2 className="user_name">{user.firstName} {user.lastName}</h2>
                                        {user.id != 23 &&
                                            <button onClick={() => toggle(user.id)}>
                                                <img src={theme === "dark" ? "/svg/down_light.svg" : "/svg/down_dark.svg"} alt="toggle" className={`arrow ${moreInfo[user.id] ? "toggle" : ""}`} />
                                            </button>
                                        }
                                    </div>
                                    {user.id != 23 &&
                                        <div className={`details order_user_details ${moreInfo[user.id] ? "open" : ""}`}>
                                            <div style={{ overflow: "hidden" }}>
                                                <p><b>Пошта:</b> {user.email}</p>
                                                <p><b>Телефон:</b> {user.phone_number}</p>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className="all_orders">
                                    {user.orders.map(order =>
                                        <div className="order_details">
                                            <div className="order-date">
                                                <h3>{formatDate(order.date, lang)}</h3>
                                                <button onClick={() => toggleOrder(order.id)}>
                                                    <img src={theme === "dark" ? "/svg/down_light.svg" : "/svg/down_dark.svg"} alt="toggle" className={`arrow ${moreOrder[order.id] ? "toggle" : ""}`} />
                                                </button>
                                            </div>
                                            <div className={`details order_user_details ${moreOrder[order.id] ? "open" : ""}`}>
                                                <div style={{ overflow: "hidden" }}>
                                                    {order.cart.map(item => {
                                                        const event = events.find(e =>
                                                            e.tickets.some(t => t.date_id === item.ticket_date_id)
                                                        );

                                                        const eventId = event?.id;
                                                        const eventTitle = event?.title;
                                                        const ticket = event?.tickets.find(t => t.date_id === item.ticket_date_id);
                                                        const authorNames = authors
                                                            .filter(a => a.events.some(e => e.id === eventId))
                                                            .map(a => a.ukr.name)
                                                            .join(", ");

                                                        return (
                                                            <div key={item.id}>
                                                                <p>{eventTitle} • {authorNames} • {formatDate(ticket?.date)}</p>
                                                                <p>Статус: {ticket?.status}</p>
                                                                <p>Кількість квитків: {item?.quantity}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="section_container">
                <div className="section_title">
                    <h1>{translator?.[lang].sectionCanceled}</h1>
                    <button onClick={() => toggleSection(1)}>
                        <img src={theme === "dark" ? "/svg/down_blue.svg" : "/svg/down_red.svg"} alt="toggle" className={`arrow ${moreSection[1] ? "toggle" : ""}`} />
                    </button>
                </div>

                {justCanceled.map(just =>
                    <div className={`details section_details ${!moreSection[1] ? "open" : ""}`}>
                        <div style={{ overflow: "hidden" }}>
                            <div className="order_for_admin" key={just.id}>
                                <div className="user_info">
                                    <div className="order-date">
                                        <h2 className="user_name">{just.title}</h2>
                                        <button onClick={() => toggleCanceled(just.id)}>
                                            <img src={theme === "dark" ? "/svg/down_light.svg" : "/svg/down_dark.svg"} alt="toggle" className={`arrow ${moreCanceled[just.id] ? "toggle" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className={`all_orders details ${moreCanceled[just.id] ? "open" : ""}`}>
                                    <div style={{ overflow: "hidden" }}>
                                        <div className="details order_details">{just.tickets.map(ticket =>

                                            <div className="order-date" key={ticket.id} style={{ overflow: "hidden" }}>
                                                <h3>{formatDate(ticket.date, lang)} • {ticket.location?.[lang].country}</h3>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="section_container applies">
                <div className="section_title">
                    <h1>{translator?.[lang].sectionApplications}</h1>
                    <button onClick={() => toggleSection(2)}>
                        <img src={theme === "dark" ? "/svg/down_blue.svg" : "/svg/down_red.svg"} alt="toggle" className={`arrow ${moreSection[2] ? "toggle" : ""}`} />
                    </button>
                </div>

                <div className={`details section_details ${!moreSection[2] ? "open" : ""}`}>
                    <div style={{ overflow: "hidden" }}>
                        {table.map(t => (
                            <div key={t.status_id} className="order_for_admin">
                                <div className="user_info">
                                    <div className={`order-date`}>
                                        <h2 className="user_name">{t?.[lang]}</h2>
                                        <button onClick={() => toggleMore(t.status_id)}>
                                            <img src={theme === "dark" ? "/svg/down_light.svg" : "/svg/down_dark.svg"} alt="toggle" className={`arrow ${more[t.status_id] ? "toggle" : ""}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className={`details all_orders ${more[t.status_id] ? "open" : ""}`}>
                                    <div className="order_for_admin hidden">
                                        {t.applications.map(apply =>
                                            <div>
                                                <div className="order_details" >
                                                    <div className="header_container">
                                                        <div className="order-date">
                                                            <h3>{apply.user.name}</h3>
                                                            <button onClick={() => toggleApplies(apply.user.id)}>
                                                                <img src={theme === "dark" ? "/svg/down_light.svg" : "/svg/down_dark.svg"} alt="toggle" className={`arrow ${toggleApplies[apply.user.id] ? "toggle" : ""}`} />
                                                            </button>
                                                        </div>
                                                        <div className="order-date">
                                                            <h3>{formatDate(apply.date_apply, lang)}</h3>
                                                            <button onClick={() => toggleForm(apply.id)}>
                                                                <img src={theme === "dark" ? "/svg/down_light.svg" : "/svg/down_dark.svg"} alt="toggle" className={`arrow ${toggleForm[apply.apply_id] ? "toggle" : ""}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className={`details  ${moreApplies[apply.user.id] ? "open" : ""}`}>
                                                        <div className="order_user_details" style={{ overflow: "hidden" }}>
                                                            <div>
                                                                <p><b>Пошта:</b> {apply.user.email}</p>
                                                                <p><b>Телефон:</b> {apply.user.phone}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`details ${moreForm[apply.id] ? "open" : ""}`} style={{ "width": "600px", "marginTop": "10px" }}>
                                                    <div className="order_details" style={{ overflow: "hidden" }}>
                                                        <div className="order-date some_container">
                                                            {apply.fields.map(f =>
                                                                <div className="fields">
                                                                    <b>{f.question_ukr}</b>
                                                                    {f.answer}
                                                                </div>
                                                            )}
                                                            {t.status_id === 1 &&
                                                                <div className="fields">
                                                                    <button className="red" onClick={() => responce(apply.id, false)}>
                                                                        Відхилити
                                                                        <img src="/svg/cross.svg" alt="X" />
                                                                    </button>
                                                                    <button className="green" onClick={() => responce(apply.id, true)}>
                                                                        Схвалити
                                                                        <img src="/svg/daw.svg" alt="X" />
                                                                    </button>
                                                                </div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="section_container applies">
                <div className="section_title">
                    <h1>{translator?.[lang].sectionDeleter}</h1>
                    <button onClick={() => toggleSection(3)}>
                        <img src={theme === "dark" ? "/svg/down_blue.svg" : "/svg/down_red.svg"} alt="toggle" className={`arrow ${moreSection[3] ? "toggle" : ""}`} />
                    </button>
                </div>

                <div className={`details section_details ${!moreSection[3] ? "open" : ""}`}>
                    <div style={{ overflow: "hidden" }}>
                        {dels.map(d =>
                            <div key={d.organization_id} className="order_for_admin">
                                <div className="user_info">
                                    <div className={`order-date ${d.organization_id === 23 && `deleted`}`}>
                                        <h2 className="user_name">{d.first_name} {d.last_name}</h2>
                                        {d.organization_id != 23 &&
                                            <button onClick={() => toggle(d.organization_id)}>
                                                <img src={theme === "dark" ? "/svg/down_light.svg" : "/svg/down_dark.svg"} alt="toggle" className={`arrow ${moreInfo[d.organization_id] ? "toggle" : ""}`} />
                                            </button>
                                        }
                                        <button onClick={() => toggleApplication(d.organization_id)} style={{ "marginLeft": "auto" }}>
                                            <img src={theme === "dark" ? "/svg/down_light.svg" : "/svg/down_dark.svg"} alt="toggle" className={`arrow ${!moreApplication[d.organization_id] ? "toggle" : ""}`} />
                                        </button>
                                    </div>
                                    {d.organization_id != 23 &&
                                        <div className={`details order_user_details ${moreInfo[d.organization_id] ? "open" : ""}`}>
                                            <div style={{ overflow: "hidden" }}>
                                                <p><b>Пошта:</b> {d.email}</p>
                                                <p><b>Телефон:</b> {d.phone_number}</p>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className={`details section_details ${!moreApplication[d.organization_id] ? "open" : ""}`}>
                                    <div style={{ overflow: "hidden" }}>
                                        <div className="all_orders" style={{ "align-items": "center" }}>
                                            <div className="order_for_admin hidden" style={{ "width": "80%" }}>
                                                <div className="order_details" style={{ "width": "100%" }}>
                                                    <div className="header_container">
                                                        <div className="fields different">
                                                            <h3 style={{ "color": "#000" }}>{d[`name_${lang}`]}</h3>
                                                            <button className="red" onClick={() => rejectDelete(d.organization_id)}>
                                                                Відхилити
                                                                <img src="/svg/cross.svg" alt="X" />
                                                            </button>
                                                            <button className="green" onClick={() => approveDelete(d.organization_id)}>
                                                                Схвалити
                                                                <img src="/svg/daw.svg" alt="X" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}