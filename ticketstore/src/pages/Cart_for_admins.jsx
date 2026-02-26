import { normalizedOStatuses } from "../utils/normalizedorderstatuses";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import './css/profile.css';

export default function Cart_for_admins() {
    const { user } = useContext(UserContext);
    const [cart, setCart] = useState([]);

    const setStat = async (userId, orderId, statusId) => {
        try {
            await fetch("http://localhost:5000/stat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    order_id: orderId,
                    status_id: statusId
                })
            });

            setCart(prev =>
                prev.map(user =>
                    user.id !== userId
                        ? user
                        : {
                            ...user,
                            orders: user.orders.map(order =>
                                order.id !== orderId
                                    ? order
                                    : { ...order, status: statusId }
                            )
                        }
                )
            );

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!user) return;

        fetch("http://localhost:5000/history")
            .then(res => res.json())
            .then(data => setCart(normalizedOStatuses(data)))
            .catch(console.error);
    }, [user]);

    if (!user) {
        return (
            <div className="cart_page">
                <div className="alternative">
                    <img src="/svg/notAuth.svg" alt="not-auth" />
                    <h1>Ви не авторизовані</h1>
                </div>
            </div>
        );
    }

    const usersWithOrdersTotal = cart.map(user => ({
        ...user,
        orders: user.orders.map(order => {
            const total = order.books.reduce((acc, book) => {
                acc.totalSum += Number(book.price) * Number(book.quantity);
                acc.totalCount += Number(book.quantity);
                return acc;
            }, { totalSum: 0, totalCount: 0 });

            return {
                ...order,
                ...total
            };
        })
    }));


    return (
        <div className="admin_cart">
            <h1>Поточні замовлення</h1>

            <div className="admin_cart__list">
                {usersWithOrdersTotal.map(user => (
                    <div key={user.id} className={`item ${user.isActive === "F" && `deleted`}`}>
                        <div className="order-date">
                            <h3 className="user_name">{user.userer}</h3>
                            {user.isActive === "F" && <h3> Видалений</h3>}
                        </div>
                        {user.orders.map(order => (
                            <div key={order.id} className="order">
                                <div className="main_order">
                                    <div>
                                        <p>№{order.id}</p>
                                        <select name="status" disabled={user.isActive === "F"} id={`status_${order.id}`}
                                            onChange={e => setStat(user.id, order.id, e.target.value)}
                                            value={order.status}
                                        >
                                            <option value="1">Нове</option>
                                            <option value="2">В обробці</option>
                                            <option value="3">Завершено</option>
                                            <option value="4">Скасовано</option>
                                        </select>
                                    </div>
                                    <div>
                                        <p>Сума: {order.totalSum} грн</p>
                                        <p>Всього: {order.totalCount}</p>
                                    </div>
                                </div>
                                <div className="book-item">
                                    {order.books.map(book => (
                                        <ul className="book_ul" key={`${order.id}_${book.book_id}`}>
                                            <li className="book-title">{book.title}</li>
                                            <li className="book-author">{book.author}</li>
                                            <li className="book-quantity">К-сть: {book.quantity}</li>
                                            <li className="book-price">{book.price} грн</li>
                                        </ul>
                                    ))}
                                </div>

                            </div>
                        ))}

                    </div>
                ))}
            </div>
        </div>
    );
}
