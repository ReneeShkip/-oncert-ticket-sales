import { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useEvents } from "../context/EventContext";
import Alert from "../components/Alert";
import { UserContext } from "../context/UserContext";
import { MoreContext } from "../context/MoreContext.jsx";
import { usePerformers } from "../context/AuthorContext";
import './css/profile.css';

async function editInfo(user) {
    const response = await fetch("http://localhost:5000/edit_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update info");
    }
    return response.json();
}

async function editOrganization(user) {
    const response = await fetch("http://localhost:5000/edit_performer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update info");
    }
    return response.json();
}

async function updateEvent(data) {
    const response = await fetch("http://localhost:5000/edit_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create event");
    }
    return response.json();
}


async function createEvent(data) {
    const response = await fetch("http://localhost:5000/create_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create event");
    }
    return response.json();
}

export default function MyProfile() {
    const { user, setUser, handleLogout } = useContext(UserContext);
    const role = user?.role;
    const [first_name, setFirstName] = useState(user?.first_name || "");
    const [last_name, setLastName] = useState(user?.last_name || "");
    const [phone_number, setPhone] = useState(user?.phone_number || "");
    const [email, setEmail] = useState(user?.email || "");
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [theText, setText] = useState("");
    const [func, setFunc] = useState(null);
    const { lang, theme } = useContext(MoreContext);
    const user_id = user?.id;
    const { events } = useEvents();
    const [moreInfo, setMoreInfo] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const [photoEventFile, setPhotoEventFile] = useState(null);
    const [isChanges, setChanges] = useState(false);
    const [genres, setGenres] = useState([]);
    const [types, setTypes] = useState([]);
    const { authors } = usePerformers();

    const [moreSection, setMoreSection] = useState([]);


    const translator = {
        ukr: {
            title: "Особиста інформація",
            subTtitle: "Мої квитки",
            currency: "грн",
            pricer: "Ціна",
            orderDate: "Дата покупки",
            eventDate: "Дата події",
            status: "Статус",
            ticketsCount: "Кількість квитків",
            changeBtn: "Редагувати",
            addBtn: "Додати",
            deleter: "Вийти і видалити",
            notError: "Ви не авторизовані",
            perfTitle: "Інформація виконавця",
            fileBtn: "Обрати файл",
            eventTitle: "Події виконавця",
            nameUkr: "Назва (Українською)",
            nameEng: "Name (English)",
            descriptionUkr: "Опис (Українською)",
            descriptionEng: "Description (English)",
            links: "Посилання",
            eventLocation: "Локація події",
            eventName: "Назва події",
            eventType: "Тип події",
            eventDescription: "Опис події",
            eventDuration: "Тривалість",
            eventPrice: "Ціна",
            eventGenres: "Жанри",
            eventTickets: "Кількість квитків",
            addDate: "Додати дату",
            info: {
                email: "Пошта",
                fName: "Ім'я",
                lName: "Прізвище",
                phone: "Телефон",
            },
        },
        eng: {
            title: "Personal info",
            subTtitle: "My tickets",
            currency: "uah",
            pricer: "Price",
            orderDate: "Order date",
            eventDate: "Event date",
            status: "Status",
            ticketsCount: "Count of tickets",
            changeBtn: "Edit",
            addBtn: "Add",
            deleter: "Exit and delete",
            notError: "You're not autorized",
            perfTitle: "Performer information",
            fileBtn: "Choose file",
            eventLocation: "Event Location",
            eventTitle: "Performer's events",
            nameUkr: "Name (Ukrainian)",
            nameEng: "Name (English)",
            descriptionUkr: "Description (Ukrainian)",
            descriptionEng: "Description (English)",
            links: "Links",
            eventName: "Event Name",
            eventType: "Event Type",
            eventDescription: "Event Description",
            eventDuration: "Event Duration",
            eventPrice: "Event Price",
            eventGenres: "Event Genres",
            eventTickets: "Event Tickets",
            addDate: "Add date",
            info: {
                email: "Email",
                fName: "Name",
                lName: "Last name",
                phone: "Phone",
            },
        }
    };

    const [locations, setLocations] = useState([]);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/genres")
            .then(r => r.json())
            .then(data => setGenres(data));
        fetch("http://localhost:5000/locations")
            .then(r => r.json())
            .then(data => setLocations(data));

        fetch("http://localhost:5000/country")
            .then(r => r.json())
            .then(data => setCountries(data));
    }, []);


    const toggleSection = (id) => setMoreSection(prev => ({ ...prev, [id]: !prev[id] }));
    const cancel = () => {
        setShowAlert(false);
    };

    const handleEditEvent = (event) => {
        setEditing(true);
        setEditedEvent({
            id: event.id,
            title: event.title || "",
            description: event.description || "",
            cover: event.cover || "",
            duration: event.duration || "",
            price: event.price || "",
            type_id: event.type_id || "",
            genres: event.genres ? event.genres.map(g => String(g.id)) : []
        });

        setDates(
            event.tickets.map(ticket => ({
                id: ticket.date_id,
                date: ticket.date
                    ? new Date(ticket.date).toISOString().slice(0, 16)
                    : "",
                quantity: ticket.quantity || "",
                location_id: ticket.location_id || "",
                newLocation: false,
                address_ukr: "",
                address_eng: "",
                country_id: ""
            }))
        );

        setPhotoEventFile(null);

        setChanges(true);
    };

    const thisPerformer = authors?.filter(a => a.user_id == user?.id) || [];
    const toggle = (id) => setMoreInfo(prev => ({ ...prev, [id]: !prev[id] }));
    useEffect(() => {
        if (user) {
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setPhone(user.phone_number);
            setEmail(user.email);
        }

    }, [user]);

    const handleAddEvent = () => {
        setEditing(false);
        console.log("Yass!");
        setEditedEvent({
            id: "",
            title: "",
            description: "",
            cover: "",
            duration: "",
            price: "",
            type_id: "",
            genres: []
        });

        setDates([{
            date: "",
            quantity: "",
            location_id: "",
            newLocation: false,
            address_ukr: "",
            address_eng: "",
            country_id: ""
        }]);

        setPhotoEventFile(null);

        setChanges(true);
    };

    const [editedPerformer, setEditedPerformer] = useState({});
    const [editedEvent, setEditedEvent] = useState({
        id: "",
        title: "",
        description: "",
        cover: "",
        duration: "",
        price: "",
        type_id: ""
    });

    const [isEditing, setEditing] = useState(false);
    const [dates, setDates] = useState([{
        date: "",
        quantity: "",
        location_id: "",
        newLocation: false,
        address_ukr: "",
        address_eng: "",
        country_id: ""
    }]);

    const addDate = () => setDates(prev => [...prev, { date: "", location_id: "", quantity: "" }]);
    const removeDate = (i) => setDates(prev => prev.filter((_, idx) => idx !== i));
    const updateDate = (i, field, value) => setDates(prev =>
        prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d)
    );

    useEffect(() => {
        if (!authors || !user) return;

        const performer = authors?.find(a => a.user_id == user?.id);

        if (performer) {
            setEditedPerformer({
                id: performer.id,
                name_ukr: performer.ukr.name,
                name_eng: performer.eng.name,
                biography_ukr: performer.ukr.biography,
                biography_eng: performer.eng.biography,
                photo: performer.photo,
                links: performer.links
            });
        }
    }, [authors, user]);

    useEffect(() => {
        if (!user || role === "admin") {
            return;
        }
        if (!events || !Array.isArray(events)) return;
        Promise.all([
            fetch(`http://localhost:5000/history?user_id=${user?.id}`).then(r => r.json()),
        ]).then(([cartData]) => {
            const purchasedDateIds = cartData.map(item => item.ticket_date_id);

            const filteredEvents = events
                .filter(e => e.tickets.some(t => purchasedDateIds.includes(t.date_id)))
                .map(e => ({
                    ...e,
                    tickets: e.tickets
                        .filter(t => purchasedDateIds.includes(t.date_id))
                        .map(t => ({
                            ...t,
                            purchase: cartData.find(d => d.ticket_date_id === t.date_id)
                        }))
                }));

            setHistory(filteredEvents);
        }).catch(console.error);
    }, [user, events]);

    useEffect(() => {
        fetch(`http://localhost:5000/types`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Server error");
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    console.log(data)
                    setTypes(data)
                }
            })
            .catch(err => console.error(err));
    }, []);

    const removeItem = async (id) => {
        if (!id) {
            console.error("removeItem called with invalid id:", id);
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/cart", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, id: id, isReturn: true })
            })

            if (!res.ok) throw new Error("Remove item failed");

            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const columns = Math.ceil(Math.sqrt(genres.length));
    const matrix = [];

    for (let i = 0; i < genres.length; i += columns) {
        matrix.push(genres.slice(i, i + columns));
    }

    const deleteOrganization = async (id) => {
        const updatedUser = {
            ...user,
            role: "ex"
        };

        try {
            await editInfo(updatedUser);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            const res = await fetch(`http://localhost:5000/want_delete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: id })
            });
            const data = await res.json();
            console.log("response:", data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const deleteIt = async () => {

        if (!user_id) return;

        try {
            const res = await fetch("http://localhost:5000/account", {
                method: "delete",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id })
            });

            if (!res.ok) throw new Error("Помилка видалення");

            const data = await res.json();
            handleLogout();
            localStorage.removeItem("token");
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) {
        return (
            <div className="cart_page">
                <div className="alternative">
                    <img src="/svg/notAuth.svg" alt="not-auth" />
                    <h2>{translator?.[lang].notError}</h2>
                </div>
            </div>
        );
    }

    console.log("event:", events);

    return (
        <div className="profile_page">
            {showAlert && <Alert
                text={theText}
                onConfirm={func}
                onCancel={cancel}
            />}
            <div className="profile_info_section">
                <div className="section_title">
                    <h1>{translator?.[lang].title}</h1>
                    <button onClick={() => toggleSection(0)}>
                        <img src={theme === "dark" ? "/svg/down_blue.svg" : "/svg/down_red.svg"} alt="toggle" className={`arrow ${moreSection[0] ? "toggle" : ""}`} />
                    </button>
                </div>
                <div className={`details section_details ${!moreSection[0] ? "open" : ""}`}>
                    <div style={{ overflow: "hidden" }}>
                        <div className="profile_info">
                            <div className="prof">{translator?.[lang].info.email}<input value={email} onChange={e => setEmail(e.target.value)} /></div>
                            <div className="prof">{translator?.[lang].info.fName}<input value={first_name} onChange={e => setFirstName(e.target.value)} /></div>
                            <div className="prof">{translator?.[lang].info.lName}<input value={last_name} onChange={e => setLastName(e.target.value)} /></div>
                            <div className="prof">{translator?.[lang].info.phone}<input value={phone_number} onChange={e => setPhone(e.target.value)} /></div>
                            {role != "admin" &&
                                <div className="probtns">
                                    <div className="prof">
                                        <button className="edit" onClick={async () => {
                                            const updatedUser = {
                                                id: user?.id,
                                                first_name,
                                                last_name,
                                                phone_number,
                                                email,
                                                role: role
                                            };

                                            try {
                                                await editInfo(updatedUser);
                                                setUser(updatedUser);
                                                localStorage.setItem('user', JSON.stringify(updatedUser));
                                                setText("Дані успішно оновлено");
                                                setFunc(() => null)
                                                setShowAlert(true);
                                            } catch (e) {
                                                setError(e.message);
                                                setText("Помилка: " + e.message);
                                                setFunc(() => null)
                                                setShowAlert(true);
                                            }
                                        }}>
                                            {translator?.[lang].changeBtn}
                                        </button></div>
                                    <button className="deleter" onClick={
                                        () => {
                                            if (role === "performer") {

                                                setText(<>Ви не можете видалити свій обліковий запис, поки ви є виконавцем. Подати заяву на видалення виконавців?</>);
                                                settFunc(() => () =>
                                                    thisPerformer.forEach(element => {
                                                        deleteOrganization(element.id)
                                                    })
                                                );
                                            }
                                            else if (user.role === "future") {
                                                setText(<>Якщо ви зараз видалите акаунт, ваші заявки не будуть переглянуті</>);
                                                settFunc(() => () =>
                                                    thisPerformer.forEach(element => {
                                                        deleteOrganization(element.id)
                                                    }).then(() => deleteIt())
                                                );

                                            } else if (user.role === "ex") {
                                                setText(<>Ви не можете видалити свій обліковий запис, поки ви є виконавцем</>);
                                                settFunc(() => null);
                                            } else {
                                                setText(<>Ви певні, що хочете видалити акаунт?</>)
                                                setFunc(() => deleteIt)
                                            }
                                            showAlert(true);
                                        }
                                    }>{translator?.[lang].deleter}</button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            {role != "admin" &&
                <div className="profile_info_section">
                    <div className="section_title">
                        <h1>{translator?.[lang].subTtitle}</h1>
                        <button onClick={() => toggleSection(1)}>
                            <img src={theme === "dark" ? "/svg/down_blue.svg" : "/svg/down_red.svg"} alt="toggle" className={`arrow ${moreSection[1] ? "toggle" : ""}`} />
                        </button>
                    </div>
                    <div className={`details section_details ${!moreSection[1] ? "open" : ""}`}>
                        <div style={{ overflow: "hidden" }}>
                            {history.map(event => (
                                <div key={`event_${event.id}`} className="item">
                                    <div className="book-title">
                                        {event?.title}
                                        <div className="right_side_title">
                                            {event.organizations.map(org => {
                                                const authorNames = authors
                                                    .filter(a => a.events.some(e => e.id === event.id))
                                                    .map(a => lang === 'ukr' ? a.ukr.name : a.eng.name)
                                                    .join(", ");

                                                return (
                                                    <div key={`org_${org.id}`}>{authorNames}</div>
                                                );
                                            })}
                                            <button onClick={() => toggle(event.id)}>
                                                <img src={`/svg/down_${theme}.svg`} alt="toggle" className={`arrow ${moreInfo[event.id] ? "toggle" : ""}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`details ${moreInfo[event.id] ? "open" : ""}`}>
                                        <div className="book-price">
                                            <div className="pricer">
                                                <div>{translator?.[lang].pricer}: {event.price} {translator?.[lang].currency}</div>


                                                {event.tickets.map(ticket => (
                                                    <div key={`ticket_${ticket.date_id}`}>
                                                        <div>{translator?.[lang].eventDate}: {new Date(ticket.date).toLocaleDateString("uk-UA")}</div>
                                                        <div>{translator?.[lang].orderDate}: {new Date(ticket.purchase?.reserved_until).toLocaleDateString("uk-UA")}</div>
                                                        <div>{translator?.[lang].status}: {ticket.status}</div>
                                                        <div>{translator?.[lang].eventLocation}: {ticket.location?.[lang].address} • {ticket.location?.[lang].country}</div>
                                                        <div>{translator?.[lang].ticketsCount}: {ticket.purchase?.quantity}</div>
                                                        <button className="deleter" onClick={() => removeItem(ticket.purchase?.id)}>Cancel</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
            {(role == "performer" ||
                role == "ex" ||
                role == "future") &&
                (<div className="profile_info_section" style={{ "width": "80%" }}>
                    <div className="section_title">
                        <h1>{translator?.[lang].perfTitle}</h1>
                        <button onClick={() => toggleSection(2)}>
                            <img src={theme === "dark" ? "/svg/down_blue.svg" : "/svg/down_red.svg"} alt="toggle" className={`arrow ${moreSection[2] ? "toggle" : ""}`} />
                        </button>
                    </div>
                    <div className={`details section_details ${!moreSection[2] ? "open" : ""}`}>
                        <div style={{ overflow: "hidden" }}>
                            {role === "future"
                                &&
                                <div>
                                    <p className="new_p  new_new_p">Ваша заявка на співпрацю ще в обробці</p>
                                </div>
                            }
                            {thisPerformer.map(p =>
                                <div className="new-container">
                                    <div className="profile_info performer-container">
                                        <div className="for-foto">
                                            <img src={p.photo === "" ? "/img/covers/none.png" : `/img/covers/${p.photo}`} alt="photo" />
                                            <div className="container-btn">
                                                <div className="input-container-button">
                                                    <input
                                                        disabled={role === "ex"}
                                                        type="file"
                                                        accept="image/*"
                                                        id="photo-upload"
                                                        style={{ display: 'none' }}
                                                        onChange={e => setPhotoFile(e.target.files[0])}
                                                    />

                                                    <label htmlFor="photo-upload" className={`upload-btn inputs ${role === "ex" ? "disabled" : ""} `} disabled={role === "ex"}>
                                                        {translator?.[lang].fileBtn}
                                                    </label>

                                                    {photoFile && <p>{photoFile.name}</p>}
                                                </div>
                                                {role === "performer" && <div className="input-container" style={{
                                                    "justifyContent": "space-around", "width": "100%"
                                                }}>

                                                    <button className="edit" style={{ "margin": "0" }}
                                                        onClick={async () => {
                                                            try {
                                                                let photoName = editedPerformer.photo;

                                                                if (photoFile) {
                                                                    const formData = new FormData();
                                                                    formData.append('photo', photoFile);
                                                                    formData.append('id', editedPerformer.id);

                                                                    const uploadRes = await fetch('http://localhost:5000/upload_photo', {
                                                                        method: 'POST',
                                                                        body: formData
                                                                    });
                                                                    const uploadData = await uploadRes.json();
                                                                    photoName = uploadData.filename;
                                                                }

                                                                await editOrganization({ ...editedPerformer, photo: photoName });
                                                                setText("Дані успішно оновлено");
                                                                setShowAlert(true);
                                                            } catch (e) {
                                                                setText("Помилка: " + e.message);
                                                                setShowAlert(true);
                                                            }
                                                        }}>{translator?.[lang].changeBtn}</button>

                                                    <button className="deleter" onClick={async () => {
                                                        const updatedUser = {
                                                            id: user?.id,
                                                            first_name,
                                                            last_name,
                                                            phone_number,
                                                            email,
                                                            role: role
                                                        };
                                                        try {
                                                            setText(<>Ви впевнені, що хочете видалити виконавця?</>);
                                                            setFunc(() => () => deleteOrganization(p.user_id));
                                                            setShowAlert(true);
                                                        } catch (e) {
                                                            setText("Помилка: " + e.message);
                                                            setShowAlert(true);
                                                        }
                                                    }}>Delete</button>
                                                </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="sub-photo">
                                            <div className="input-container">
                                                <div>
                                                    <label>{translator?.[lang].nameUkr}: </label>
                                                    <input
                                                        value={editedPerformer.name_ukr || ""}
                                                        name="ukrName"
                                                        disabled={role === "ex"}
                                                        onChange={e => setEditedPerformer(prev => ({ ...prev, name_ukr: e.target.value }))}
                                                    />
                                                </div>
                                                <div>
                                                    <label>{translator?.[lang].nameEng}: </label>
                                                    <input
                                                        disabled={role === "ex"}
                                                        value={editedPerformer.name_eng || ""}
                                                        name="engName"
                                                        onChange={e => setEditedPerformer(prev => ({ ...prev, name_eng: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label>{translator?.[lang].descriptionUkr}: </label>
                                                <textarea
                                                    disabled={role === "ex"}
                                                    className="inputs"
                                                    value={editedPerformer.biography_ukr || ""}
                                                    name="ukrDescription"
                                                    onChange={e => setEditedPerformer(prev => ({ ...prev, biography_ukr: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label>{translator?.[lang].descriptionEng}: </label>
                                                <textarea
                                                    disabled={role === "ex"}
                                                    className="inputs"
                                                    value={editedPerformer.biography_eng || ""}
                                                    name="engDescription"
                                                    onChange={e => setEditedPerformer(prev => ({ ...prev, biography_eng: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <label>{translator?.[lang].links}: </label>
                                                <input
                                                    disabled={role === "ex"}
                                                    value={editedPerformer.links || ""}
                                                    name="ukrName"
                                                    onChange={e => setEditedPerformer(prev => ({ ...prev, links: e.target.value }))}
                                                />
                                            </div>
                                            {role === "ex" && (
                                                <div>
                                                    <p className="new_p">Ваша заявка на видалення ще в обробці</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="profile_info_section">
                                        <div className="section_title">
                                            <h1>{translator?.[lang].eventTitle}</h1>
                                            <button onClick={() => toggleSection(3)}>
                                                <img src={theme === "dark" ? "/svg/down_blue.svg" : "/svg/down_red.svg"} alt="toggle" className={`arrow ${moreSection[3] ? "toggle" : ""}`} />
                                            </button>
                                        </div>
                                        <div className={`details section_details ${!moreSection[3] ? "open" : ""}`}>
                                            <div style={{ overflow: "hidden" }}>
                                                <div className="profile_info performer-container list_of_events" style={{ "background": "none", "boxShadow": "none" }}>
                                                    {events
                                                        .filter(e => e.organizations.some(o => o.id === p.id))
                                                        .map(event => (
                                                            <div key={event.id} className="listbook">
                                                                <div className="container-for-link">
                                                                    <NavLink
                                                                        key={event.id}
                                                                        to={`/event/details/${event.id}`}
                                                                    >
                                                                        <div className="au_short_info">
                                                                            <div className="img_container">
                                                                                <img src={`/img/covers/${event.cover}`} className="cover" />
                                                                            </div>
                                                                            <p className="no_p">{event?.title}</p>
                                                                        </div>

                                                                    </NavLink>
                                                                    {role === "performer" && (
                                                                        <button className="closer update" onClick={() => handleEditEvent(event)}>
                                                                            <img src="/svg/edit.svg" alt="edit" />
                                                                        </button>)}
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                    {role === "performer" && (
                                                        <button className="edit" onClick={handleAddEvent}>
                                                            {translator?.[lang].addBtn}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isChanges &&
                                        <div className="profile_info_section" style={{ "borderBottom": "none" }}>
                                            <button className="closer out" onClick={() => setChanges(false)}>
                                                ✖
                                            </button>
                                            <div className="profile_info performer-container">
                                                <div className="for-foto">
                                                    <img
                                                        src={
                                                            photoEventFile
                                                                ? URL.createObjectURL(photoEventFile)
                                                                : editedEvent.cover
                                                                    ? `/img/covers/${editedEvent.cover}`
                                                                    : "/img/covers/none.png"
                                                        }
                                                        alt="photo"
                                                    />                                            <div>
                                                        <div className="input-container-button">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                id="event-photo-upload"
                                                                style={{ display: 'none' }}
                                                                onChange={e => setPhotoEventFile(e.target.files[0])}
                                                            />

                                                            <label htmlFor="event-photo-upload" className="upload-btn inputs">
                                                                {translator?.[lang].fileBtn}
                                                            </label>

                                                            {photoEventFile && <p>{photoEventFile.name}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="sub-photo">

                                                    <div className="input-container">
                                                        <div>
                                                            <label>{translator?.[lang].eventName}</label>
                                                            <input
                                                                value={editedEvent.title || ""}
                                                                name="ukrEventName"
                                                                onChange={e => setEditedEvent(prev => ({ ...prev, title: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label>{translator?.[lang].eventType}</label>
                                                            <select
                                                                style={{ "width": "auto" }}
                                                                value={editedEvent.type_id || ""}
                                                                onChange={e => setEditedEvent(prev => ({ ...prev, type_id: e.target.value }))}
                                                            >
                                                                <option value="" disabled></option>
                                                                {types.map(t => (
                                                                    <option key={t.ID} value={t.ID}>
                                                                        {t?.[`type_${lang}`]}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label>{translator?.[lang].eventDescription}</label>
                                                        <textarea
                                                            className="inputs"
                                                            value={editedEvent.description || ""}
                                                            name="engEventName"
                                                            onChange={e => setEditedEvent(prev => ({ ...prev, description: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="input-container">
                                                        <div>
                                                            <label>{translator?.[lang].eventDuration}</label>
                                                            <input
                                                                value={editedEvent.duration || ""}
                                                                name="engDescription"
                                                                onChange={e => setEditedEvent(prev => ({ ...prev, duration: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label>{translator?.[lang].eventPrice}</label>
                                                            <input
                                                                type="number"
                                                                style={{ "width": "100px" }}
                                                                value={editedEvent.price || 100}
                                                                name="ukrName"
                                                                onChange={e => e.target.value <= 2000 && e.target.value >= 0 && setEditedEvent(prev => ({ ...prev, price: e.target.value }))}
                                                            />
                                                        </div>

                                                    </div>
                                                    <div>
                                                        <label>{translator?.[lang].eventGenres}</label>
                                                        {matrix.map((row, rowIndex) => (
                                                            <ul key={rowIndex} className="genres_row">
                                                                {row.map(g => (
                                                                    <label key={g.ID} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="input-check"
                                                                            value={g.ID}
                                                                            checked={(editedEvent.genres || []).includes(String(g.ID))}
                                                                            onChange={e => {
                                                                                const id = String(g.ID);
                                                                                setEditedEvent(prev => ({
                                                                                    ...prev,
                                                                                    genres: e.target.checked
                                                                                        ? [...(prev.genres || []), id]
                                                                                        : (prev.genres || []).filter(x => x !== id)
                                                                                }));
                                                                            }}
                                                                        />
                                                                        {g[`genre_${lang}`]}
                                                                    </label>
                                                                ))}

                                                            </ul>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        {dates.map((d, i) => (
                                                            <div key={i}>
                                                                <div className="containers-for-date">
                                                                    <div>
                                                                        <div className="input-container">
                                                                            <label>{translator?.[lang].eventDate}</label>
                                                                            <input
                                                                                type="datetime-local"
                                                                                value={d.date}
                                                                                onChange={e => updateDate(i, 'date', e.target.value)}
                                                                            />
                                                                            <label>{translator?.[lang].eventTickets}</label>
                                                                            <input
                                                                                style={{ "width": "80px" }}
                                                                                value={d.quantity || 50}
                                                                                type="number"
                                                                                onChange={e => e.target.value <= 9999 && e.target.value >= 50 && updateDate(i, 'quantity', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <label>
                                                                            <input
                                                                                className="input-check"
                                                                                type="checkbox"
                                                                                checked={d.newLocation}
                                                                                onChange={e => updateDate(i, 'newLocation', e.target.checked)}
                                                                            />
                                                                            Нова локація
                                                                        </label>

                                                                        {!d.newLocation ? (
                                                                            <select
                                                                                style={{ "width": "auto" }}
                                                                                value={d.location_id}
                                                                                onChange={e => updateDate(i, 'location_id', e.target.value)}
                                                                            >
                                                                                <option value="" disabled>Оберіть локацію</option>
                                                                                {locations.map(l => (
                                                                                    <option key={l.ID} value={l.ID}>
                                                                                        {lang === 'ukr' ? l.address_ukr : l.address_eng}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        ) : (
                                                                            <div className="location-div">
                                                                                <select
                                                                                    value={d.country_id}
                                                                                    onChange={e => updateDate(i, 'country_id', e.target.value)}
                                                                                >
                                                                                    <option value="" disabled>Оберіть місто</option>
                                                                                    {countries.map(c => (
                                                                                        <option key={c.ID} value={c.ID}>
                                                                                            {lang === 'ukr' ? c.name_ukr : c.name_eng}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                                <input
                                                                                    placeholder="Адреса (укр)"
                                                                                    value={d.address_ukr}
                                                                                    onChange={e => updateDate(i, 'address_ukr', e.target.value)}
                                                                                />
                                                                                <input
                                                                                    placeholder="Address (eng)"
                                                                                    value={d.address_eng}
                                                                                    onChange={e => updateDate(i, 'address_eng', e.target.value)}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {dates.length > 1 &&
                                                                        <button className="closer small" onClick={() => removeDate(i)}>✖</button>
                                                                    }
                                                                </div>

                                                            </div>
                                                        ))}
                                                        <button onClick={addDate} className="clear_button">+ {translator?.[lang].addDate}</button>
                                                    </div>
                                                    <button className="edit" onClick={async () => {
                                                        try {
                                                            let photoName = editedEvent.cover;

                                                            if (photoEventFile) {
                                                                const formData = new FormData();
                                                                formData.append('photo', photoEventFile);
                                                                formData.append('id', editedEvent.id);

                                                                const uploadRes = await fetch('http://localhost:5000/upload_photo', {
                                                                    method: 'POST',
                                                                    body: formData
                                                                });
                                                                const uploadData = await uploadRes.json();
                                                                console.log("upload response:", uploadData);
                                                                photoName = uploadData.filename;
                                                            }

                                                            console.log("photoName:", photoName);
                                                            console.log("editedEvent:", editedEvent);
                                                            if (isEditing) {
                                                                await updateEvent({
                                                                    ...editedEvent, cover: photoName, sub_organization: p.id,
                                                                    dates
                                                                })
                                                            } else {
                                                                await createEvent({
                                                                    ...editedEvent, cover: photoName, sub_organization: p.id,
                                                                    dates
                                                                });
                                                            }
                                                            setText("Дані успішно оновлено");
                                                            setShowAlert(true);
                                                        } catch (e) {
                                                            setText("Помилка: " + e.message);
                                                            setShowAlert(true);
                                                        }
                                                    }}>{isEditing ? translator?.[lang].changeBtn : translator?.[lang].addBtn}</button>

                                                </div>

                                            </div>
                                        </div>
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                </div>)
            }
        </div>
    );
}
