import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useEmail } from "../utils/SendMail";
import "./css/Payment.css";

export default function PaymentPage() {
    const { state } = useLocation();
    const { sendEmail } = useEmail();

    const order = async () => {
        const cart_ids = state.order.flatMap(item => item.tickets.map(t => t.cart_id));
        const user_id = state?.user?.id;
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
                sendEmail({ user: state.user, order: state.order })
                navigate("/returner");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSuccess = async () => {
        if (state?.user && state?.order) {
            await order();
        }
    }
    const [searchParams] = useSearchParams();

    const id = searchParams.get('id');
    const eventName = searchParams.get('name');
    const price = searchParams.get('price');
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle');
    const [card, setCard] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    const [errors, setErrors] = useState({});

    const handlePay = () => {
        const newErrors = {};

        if (!card || card.length < 19) newErrors.card = 'Введіть коректний номер картки';
        if (!expiry || expiry.length < 5) newErrors.expiry = 'Введіть термін дії';
        if (!cvv || cvv.length < 3) newErrors.cvv = 'Введіть CVV';
        if (!name.trim()) newErrors.name = 'Введіть ім\'я на картці';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setStatus('processing');
        setTimeout(async () => {
            await handleSuccess();
            setStatus('success');
        }, 1800);
    };

    const formatCard = (val) =>
        val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

    const formatExpiry = (val) => {
        const v = val.replace(/\D/g, '').slice(0, 4);
        return v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
    };



    if (status === 'success') {
        return (
            <div className="payment-page">
                <div className="pay-wrap">
                    <div className="pay-card center">
                        <p className="success-title">Оплата успішна!</p>
                        <br></br>
                        <p className="success-sub">Лист з квитками відправлено на email</p>
                        <br></br>
                        <button className="reset-btn" onClick={() => navigate('/')}>
                            На головну
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="pay-wrap">
                <div className="pay-card">
                    <p className="pay-title">
                        Оплата онлайн-квитків <span className="badge">Тестовий режим</span>
                    </p>
                    <p className="pay-sub">Введіть дані картки для завершення покупки</p>

                    <div className="card-icons">
                        <div className="card-icon">VISA</div>
                        <div className="card-icon">MC</div>
                        <div className="card-icon">LPay</div>
                    </div>

                    <div className="price-row">
                        <span className="price-label">«Квитки на {eventName}»</span>
                        <span className="price-amount">₴ {price}</span>
                    </div>

                    <div className="field-group">
                        <label className="field-label">Номер картки</label>
                        <input
                            className="pay-input"
                            placeholder="0000 0000 0000 0000"
                            value={card}
                            onChange={e => setCard(formatCard(e.target.value))}
                        />
                        {errors.card && <p className="err" style={{ display: 'block' }}>{errors.card}</p>}
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label className="field-label">Термін дії</label>
                            <input
                                className="pay-input"
                                placeholder="MM/РР"
                                value={expiry}
                                onChange={e => setExpiry(formatExpiry(e.target.value))}
                            />
                            {errors.expiry && <p className="err" style={{ display: 'block' }}>{errors.expiry}</p>}
                        </div>
                        <div className="field-group">
                            <label className="field-label">CVV</label>
                            <input
                                className="pay-input"
                                placeholder="•••"
                                type="password"
                                value={cvv}
                                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            />
                            {errors.cvv && <p className="err" style={{ display: 'block' }}>{errors.cvv}</p>}
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="field-label">Ім'я на картці</label>
                        <input
                            className="pay-input"
                            placeholder="IVAN PETRENKO"
                            value={name}
                            onChange={e => setName(e.target.value.toUpperCase())}
                        />
                        {errors.name && <p className="err" style={{ display: 'block' }}>{errors.name}</p>}
                    </div>

                    <button
                        className="pay-btn"
                        onClick={handlePay}
                        disabled={status === 'processing'}
                    >
                        {status === 'processing' ? 'Обробка...' : `Оплатити ₴ ${price}`}
                    </button>

                    <p className="test-hint">
                        Тестова картка: 4242 4242 4242 4242 · 12/28 · 123
                    </p>
                </div>
            </div>
        </div>
    );
}
