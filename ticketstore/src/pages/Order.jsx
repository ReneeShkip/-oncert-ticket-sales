import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Loading from "./Loading"
import { CartContext } from "../context/CartContext";
import { MoreContext } from "../context/MoreContext";
import Alert from "../components/Alert";
import { useEmail } from "../utils/SendMail"
import { usePerformers } from "../context/AuthorContext";
import { formatDate } from "../utils/formatDate";

export default function Order() {
    const navigate = useNavigate();
    const { fetchCart } = useContext(CartContext);
    const { lang } = useContext(MoreContext);
    const { user, setUser } = useContext(UserContext);
    const [first_name, setFirstName] = useState(user?.first_name || "");
    const [last_name, setLastName] = useState(user?.last_name || "");
    const [phone_number, setPhone] = useState(user?.phone_number || "");
    const [loading, setLoading] = useState(null);
    const [postomats, getPostomat] = useState([]);
    const [warehouses, getWarehouses] = useState([]);
    const [email, setEmail] = useState(user?.email || "");
    const [deliveryType, setDeliveryType] = useState(1);
    const { state } = useLocation();
    const [chosen, setChosen] = useState(state?.items || [])
    const [theText, setText] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const user_id = user?.id;
    const { authors } = usePerformers();
    const translator = {
        ukr: {
            currency: "грн",
            due: "До сплати",
            cancel: "Скасувати",
            nothing: "Немає товарів для оформлення"
        },
        eng: {
            currency: "uah",
            due: "Total to pay",
            cancel: "Cancel",
            nothing: "There are no products to list"
        }
    }

    const cancel = () => {
        setShowAlert(false);
    };

    if (loading) return <Loading />;

    function removeItem(id) {
        setChosen(chosen.filter(item => item.id !== id))
    }

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setPhone(user.phone_number);
            setEmail(user.email);
        }
        setLoading(false);
    }, [user]);

    const total = chosen.reduce((acc, item) => {
        if (!item) return acc;

        const quantity = item.tickets
            ? item.tickets.reduce((sum, t) => sum + t.quantity, 0)
            : item.quantity ?? 0;

        acc.totalSum += Number(item.price ?? 0) * quantity;
        acc.totalCount += quantity;
        return acc;
    }, { totalSum: 0, totalCount: 0 });

    if (chosen.length === 0) {
        return (
            <div className="order-page-container">
                <div className="order-page">
                    <div className="alternative">
                        <h2>{translator?.[lang].nothing}</h2>
                    </div>
                </div>
            </div>
        );
    }
    console.log("chosen", chosen);
    const names = chosen.map(ch => ch.title).join(', ');
    return (
        <div className="order-page-container">
            <div className="order-page">
                {showAlert && <Alert
                    text={theText}
                    onConfirm={order}
                    onCancel={cancel}
                />}
                <div className="info">
                    <h1>Контактні дані</h1>
                    <div className="profile_info">
                        <div className="prof">Ім'я<input key="info_name" value={first_name} onChange={e => setFirstName(e.target.value)} /></div>
                        <div className="prof">Прізвище<input key="info_last_name" value={last_name} onChange={e => setLastName(e.target.value)} /></div>
                        <div className="prof">Телефон<input key="info_phone" value={phone_number} onChange={e => setPhone(e.target.value)} /></div>
                        <div className="prof">Ел.Пошта<input key="info_phone" value={email} onChange={e => setEmail(e.target.value)} /></div>
                    </div>
                    <div className="profile_info checkout">
                        <div className="total-price">
                            <h2>{translator?.[lang].due}</h2>
                            <h2>{total.totalSum} {translator?.[lang].currency}</h2>
                        </div>
                        <div className="total-price">
                            <NavLink to="/cart">Скасувати</NavLink>
                            <button className="roder" style={{ "color": "#fff" }} onClick={() => navigate(`/payment?name=${names}&price=${total.totalSum}`, {
                                state: { user, order: chosen }
                            })}>
                                Купити
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{ width: "30%" }}>
                    {chosen.map(ch => (
                        <div className="book_card" key={`book_${ch.id}`}>
                            <div key={`book_${ch.title}`} className="books-section">
                                <h2>{ch.title}</h2>
                                <div className="sub_book_info">
                                    <div>
                                        <h3 style={{ "borderBottom": "1px solid #fff" }}>{authors
                                            .filter(a => a.events.some(e => e.id === ch.id))
                                            .map(a => a.ukr.name)
                                            .join(", ")}</h3>
                                        <div style={{ "borderBottom": "1px solid #fff", "marginTop": "10px" }}>
                                            <h3 className="sub_info_text">Ціна за 1: {ch.price}</h3>
                                            {ch.tickets.map(t =>
                                                <div>
                                                    <h3 className="sub_info_text">Дата: {formatDate(t.date, lang)}</h3>
                                                    <h3 className="sub_info_text">Кількість: {t.quantity}</h3>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <button
                                onClick={() => removeItem(ch.id)}
                                className="remove-btn"
                            >
                                <img src="/svg/close.svg" alt="delete" />
                            </button>
                        </div>
                    ))}
                </div>
            </div >
        </div>
    )
}
