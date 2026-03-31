import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Loading from "./Loading"
import { CartContext } from "../context/CartContext";
//import CitySelector from "../components/city_selector";
import { MoreContext } from "../context/MoreContext";
import Alert from "../components/Alert";
import { useEmail } from "../utils/SendMail"

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

    const translator = {
        ukr: {
            currency: "грн",
            due: "До сплати",
            cancel: "Скасувати"
        },
        eng: {
            currency: "uah",
            due: "Total to pay",
            cancel: "Cancel"
        }
    }

    const cancel = () => {
        setShowAlert(false);
    };

    if (loading) return <Loading />;

    function removeItem(id) {
        setChosen(chosen.filter(item => item.id !== id))
    }

    const order = async () => {
        const cart_ids = chosen.map(item => item.tickets.map(t => t.cart_id));
        try {
            const res = await fetch("http://localhost:5000/make_order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart_ids,
                    user_id
                })
            });

            if (!res.ok) throw new Error("Помилка завантаження");

            const data = await res.json();
            if (data.success) {
                sendEmail({ user, order: chosen })
                navigate("/returner");
                await fetchCart();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const { sendEmail } = useEmail();
    useEffect(() => {
        if (user) {
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setPhone(user.phone_number);
            setEmail(user.email);
        }
        setLoading(false);
    }, [user]);

    console.log("chosen", chosen);
    const total = chosen.reduce((acc, item) => {
        const itemCount = item.tickets.reduce((sum, t) => sum + t.quantity, 0);

        acc.totalSum += Number(item.price) * itemCount;
        acc.totalCount += itemCount;

        return acc;
    }, { totalSum: 0, totalCount: 0 });
    if (chosen.length === 0) {
        return <h2>Немає товарів для оформлення</h2>;
    }

    return (
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
                        <button className="roder" onClick={() => {
                            setText("Підтвердіть оформлення замовлення")
                            setShowAlert(true)
                        }
                        }>Оформити замовлення</button>
                    </div>
                </div>
            </div>
            <div style={{ width: "30%" }}>
                {chosen.map(ch => (
                    <div className="book_card" key={`book_${ch.id}`}>
                        <div key={`book_${ch.title}`} className="books-section">
                            <h2>{ch.title}</h2>
                            <div className="sub_book_info">
                                <img src={`img/covers/${ch.cover}`} alt={ch.title} className="cover" />
                                <div>
                                    <h4 style={{ fontSize: "28px", color: "#254C69" }}>{ch.first_name} {ch.last_name}</h4>
                                    <h4>Тип: {ch.type}</h4>
                                    <h4>Ціна: {ch.price * ch.quantity}</h4>
                                    <h4>Кількість: {ch.quantity}</h4>
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
    )
}