import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { CartContext } from "../context/CartContext";
import Alert from "../components/alert";
import Loading from "./Loading.jsx";
import './css/cart.css';

function Cart() {
    const [showAlert, setShowAlert] = useState(false);
    const { isAuth } = useContext(UserContext);
    const {
        cart,
        setCart,
        loading,
        updateQuantity,
        removeItem,
        removeAll
    } = useContext(CartContext);

    const [chosen, setChosen] = useState([]);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [theText, setText] = useState("");
    const [justOne, setOne] = useState(false);

    const confirmDeleteOne = () => {
        removeItem(itemToDelete);
        setShowAlert(false);
    };

    const confirmDeleteAll = () => {
        removeAll();
        setShowAlert(false);
    };

    const cancelDelete = () => {
        setShowAlert(false);
    };

    useEffect(() => {
        setChosen(prev =>
            prev.filter(ch =>
                cart.some(item => item.id === ch.id)
            )
        );
    }, [cart]);

    if (loading) return (<Loading />);

    if (!cart.length) return (
        <div className="cart_page">
            {!isAuth ? (
                <div className="alternative">
                    <img src="/svg/notAuth.svg" alt="not-auth" />
                    <h2>Ви не авторизовані</h2>
                </div>
            ) : (
                <div className="alternative">
                    <img src="/svg/emptyCart.svg" alt="cart-empty" />
                    <h2>Кошик пустий</h2>
                </div>
            )}
        </div>
    );

    const total = chosen.reduce((acc, item) => {
        acc.totalSum += Number(item.price) * item.quantity;
        acc.totalCount += Number(item.quantity);
        return acc;
    }, { totalSum: 0, totalCount: 0 });

    return (

        <div className="cart_page">
            {showAlert && <Alert
                text={theText}
                onConfirm={justOne ? confirmDeleteOne : confirmDeleteAll}
                onCancel={cancelDelete}
            />}
            <div className="cart-section">
                <div style={{ width: "100%" }}>
                    <div className="add_btns">
                        <label>
                            <input
                                name="all_box"
                                type="checkbox"
                                className="hidden_checkbox"
                                checked={cart.length > 0 && chosen.length === cart.length}
                                onChange={e => {
                                    if (e.target.checked) {
                                        setChosen(cart);
                                    } else {
                                        setChosen([]);
                                    }
                                }}
                            />
                            <div className="checkbox_button all">
                                {cart.length > 0 && chosen.length === cart.length
                                    ? "Прибрати всі"
                                    : "Обрати всі"}
                            </div>
                        </label>
                        <button onClick={() => {
                            setText(`Ви впевнені, що хочете очистити весь кошик?`)
                            setShowAlert(true)
                            setOne(false)
                        }}>
                            Видалити всі <img src="/svg/close.svg" alt="delete" />
                        </button>
                    </div>

                    <ul name="cart_books" className="cart-ul">
                        {cart.map(item => (
                            <li key={item.id}>
                                <label key={`label_${item.id}`}>
                                    <input
                                        className="hidden_checkbox"
                                        id={`cart_${item.id}`}
                                        type="checkbox"
                                        checked={chosen.some(i => i.id === item.id)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setChosen(prev => [...prev, item]);
                                            } else {
                                                setChosen(prev => prev.filter(i => i.id !== item.id));
                                            }
                                        }}
                                    />
                                    <div className="checkbox_button">
                                        <div className="main-info">
                                            <img
                                                src={`/img/covers/${item.cover}`}
                                                alt={item.title}
                                                className={`book-cover ${item.type}`}
                                            />
                                            <div className="info-cart">
                                                <NavLink to={`/book/details/${item.id}`} className="navlink">
                                                    <div>{item.title}</div>
                                                </NavLink>
                                                <div className="sub_info">
                                                    {item.first_name} {item.last_name}
                                                </div>
                                            </div>
                                            <div className="quantity-wrapper">{item.type}</div>
                                        </div>
                                        <div className="quantity-wrapper">
                                            <input
                                                type="number"
                                                className="quant"
                                                min={1}
                                                value={item.quantity}
                                                onChange={e => {
                                                    const value = Math.max(1, Number(e.target.value));

                                                    setCart(prev =>
                                                        prev.map(i => i.id === item.id ? { ...i, quantity: value } : i)
                                                    );
                                                }}
                                                onBlur={() => {
                                                    updateQuantity(item.id, item.quantity);
                                                }}
                                            /> шт
                                        </div>
                                        <div className="info-cart price">
                                            {item.price * item.quantity} грн
                                        </div>
                                        <button
                                            onClick={() => {
                                                setText(`Ви впевнені, що хочете видалити книгу зі свого кошику?`)
                                                setShowAlert(true)
                                                setOne(true)
                                                setItemToDelete(item.id)
                                            }}
                                            className="remove-btn"
                                        >
                                            <img src="/svg/close.svg" alt="delete" />
                                        </button>
                                    </div>

                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="pos"></div>

            <div className="total">
                <h1>Всього</h1>
                <h3>Обрано товарів: {total.totalCount}</h3>
                <h3>Сума: {total.totalSum} грн</h3>
                <button disabled={chosen.length === 0}>
                    <NavLink to={"/order"}
                        state={{ items: chosen }}>
                        Оформити замовлення
                    </NavLink>
                </button>
            </div>
        </div>
    );
}

export default Cart;