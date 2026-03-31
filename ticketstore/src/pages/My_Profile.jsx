import { useContext, useState, useEffect } from "react";
import Loading from "./Loading.jsx";
import { normalizeHistory } from "../utils/normalizedhistory"
import Alert from "../components/Alert";
import { UserContext } from "../context/UserContext";
import './css/profile.css';
import CitySelector from "../components/city_selector.jsx";

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

export default function MyProfile() {
    const { user, setUser, handleLogout } = useContext(UserContext);
    const [first_name, setFirstName] = useState(user?.first_name || "");
    const [last_name, setLastName] = useState(user?.last_name || "");
    const [phone_number, setPhone] = useState(user?.phone_number || "");
    const [city, setCity] = useState(user?.city || "");
    const [email, setEmail] = useState(user?.email || "");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [cityRef, setCityRef] = useState(null);
    const [theText, setText] = useState("");
    const [func, setFunc] = useState(null);
    const user_id = user?.id;

    const cancel = () => {
        setShowAlert(false);
    };

    const handleSelectCity = (option) => {
        setCity(option.Description);
        setCityRef(option.Ref);
    };

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setPhone(user.phone_number);
            setCity(user.city);
            setEmail(user.email);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!user || user.role === "admin") {
            return;
        }
        fetch(`http://localhost:5000/history?user_id=${user.id}`)
            .then(res => res.json())
            .then(data => setHistory(normalizeHistory(data)))
            .catch(console.error)
            .finally(() => setLoading(false));

    }, [user]);


    const deleteIt = async () => {

        if (!user_id) return;

        try {
            const res = await fetch("http://localhost:5000/del_ac", {
                method: "POST",
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
                    <h2>Ви не авторизовані</h2>
                </div>
            </div>
        );
    }

    if (loading) { return <Loading />; }

    return (
        <div className="profil-page">
            {showAlert && <Alert
                text={theText}
                onConfirm={func}
                onCancel={cancel}
            />}
            <div className="profile_info_section">
                <h1>Особиста інформація</h1>
                <div className="profile_info">
                    <div className="prof">Пошта<input value={email} onChange={e => setEmail(e.target.value)} /></div>
                    <div className="prof">Ім'я<input value={first_name} onChange={e => setFirstName(e.target.value)} /></div>
                    <div className="prof">Прізвище<input value={last_name} onChange={e => setLastName(e.target.value)} /></div>
                    <div className="prof">Телефон<input value={phone_number} onChange={e => setPhone(e.target.value)} /></div>
                    <CitySelector
                        city={city}
                        setCity={setCity}
                        onSelect={handleSelectCity}
                    />
                    <div className="prof">Ел. Пошта<input value={email} onChange={e => setEmail(e.target.value)} /></div>
                    {user.role != "admin" &&
                        <div className="probtns">
                            <div className="prof"><button className="edit" onClick={async () => {
                                const updatedUser = {
                                    id: user.id,
                                    first_name,
                                    last_name,
                                    phone_number,
                                    city,
                                    email,
                                    role: user.role
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
                                Змінити
                            </button></div>
                            <button className="deleter" onClick={
                                () => {
                                    setText("Ви певні, що хочете видалити акаунт?")
                                    setShowAlert(true)
                                    setFunc(() => deleteIt)
                                }
                            }>Видалити обліковий запис</button>
                        </div>
                    }
                </div>
            </div>
            {user.role != "admin" &&
                <div className="profile_info_section">
                    <h1>Історія замовлень</h1>
                    {history.map(order => {
                        const formatted = new Date(order.date).toLocaleDateString("uk-UA");
                        return (
                            <div key={`order_${order.id}`} className="item">
                                <div className="order-date">
                                    Дата замовлення: {formatted}
                                    <div className="status">
                                        Статус: {order.status}
                                    </div>
                                </div>

                                <div className="order">
                                    {order.books.map(book => (
                                        <div key={`book_${book.book_id}`} className="book-item">
                                            <div className="book-title">{book.title}</div>
                                            <div className="book-author">{book.author}</div>
                                            <div className="book-quantity">{book.quantity} шт</div>
                                            <div className="book-price">{book.price} грн</div>
                                            <div className="book-type">{book.type}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            }
        </div>
    );
}