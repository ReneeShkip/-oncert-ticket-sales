import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Loading from "../pages/Loading"
import CitySelector from "../components/city_selector";
import Alert from "../components/alert";

export default function Order() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const [first_name, setFirstName] = useState(user?.first_name || "");
    const [last_name, setLastName] = useState(user?.last_name || "");
    const [phone_number, setPhone] = useState(user?.phone_number || "");
    const [city, setCity] = useState(user?.city || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [postomats, getPostomat] = useState([]);
    const [warehouses, getWarehouses] = useState([]);
    const [posta, setPosta] = useState([]);
    const [deliveryType, setDeliveryType] = useState(1);
    const [cityRef, setCityRef] = useState(null);
    const { state } = useLocation();
    const [chosen, setChosen] = useState(state?.items || [])
    const [deps, setDep] = useState(null)
    const [theText, setText] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const user_id = user?.id;

    const cancel = () => {
        setShowAlert(false);
    };


    const handleSelectCity = (option) => {
        setCity(option.Description);
        setCityRef(option.Ref);
    };
    if (loading) return <Loading />;
    console.log(chosen)
    const postDepartment = async (cityRef) => {
        try {
            const res = await fetch("http://localhost:5000/departments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ref: cityRef })
            });

            if (!res.ok) throw new Error("Помилка завантаження");

            const data = await res.json();

            const warehouses = data.filter(wh =>
                wh.Description.startsWith("Відділення")
            );
            const postomat = data.filter(wh =>
                wh.Description.startsWith("Поштомат")
            );

            getWarehouses(warehouses);
            getPostomat(postomat);
        } catch (err) {
            setError(err.message);
        }
    };

    function removeItem(id) {
        setChosen(chosen.filter(item => item.id !== id))
    }

    const order = async () => {
        let date_and_time = new Date().toISOString()
        const cart_ids = chosen.map(item => item.id);

        if (!date_and_time || !deliveryType || !deps || !cart_ids || !user_id) {
            console.log("deps: " + deps)
        }
        try {
            const res = await fetch("http://localhost:5000/make_order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date_and_time,
                    posta_id: deliveryType,
                    post_address: deps,
                    cart_ids,
                    user_id
                })
            });

            if (!res.ok) throw new Error("Помилка завантаження");

            const data = await res.json();

            if (data.success) {
                navigate("/returner");
            }
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        fetch('http://localhost:5000/posta')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch posta');
                return res.json();
            })
            .then(data => {
                setPosta(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading categories:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);



    useEffect(() => {
        if (user) {
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setPhone(user.phone_number);
            setCity(user.city);
        }
        setLoading(false);
    }, [user]);


    useEffect(() => {
        if (!cityRef) return;
        postDepartment(cityRef);
    }, [cityRef]);

    useEffect(() => {
        if (deliveryType === 1 && warehouses.length > 0) {
            setDep(warehouses[0].Description);
        }

        if (deliveryType !== 1 && postomats.length > 0) {
            setDep(postomats[0].Description);
        }
    }, [deliveryType, warehouses, postomats]);

    const total = chosen.reduce((acc, item) => {
        acc.totalSum += Number(item.price) * item.quantity;
        acc.totalCount += Number(item.quantity);
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
                    <CitySelector
                        city={city}
                        setCity={setCity}
                        onSelect={handleSelectCity}
                    />
                    <div className="prof">
                        Тип доставки
                        <select id="type" name="type" onChange={e => setDeliveryType(e.target.value === "Нова пошта відділення" ? 1 : 2)}>
                            {posta.map(item => {
                                return (
                                    <option key={`posta_${item.id}`}>{item.posta}</option>
                                )
                            })}
                        </select>
                    </div>
                    <div className="prof">
                        Відділення
                        <select onChange={e => setDep(e.target.value)}>
                            {deliveryType === 1 ?
                                warehouses.map(dep => (
                                    <option key={dep.Ref} value={dep.Description}>
                                        {dep.Description}
                                    </option>
                                ))
                                :
                                postomats.map(dep => (
                                    <option key={dep.Ref} value={dep.Description}>
                                        {dep.Description}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className="profile_info checkout">
                    <div className="total-price">
                        <h2>До сплати</h2>
                        <h2>{total.totalSum}</h2>
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