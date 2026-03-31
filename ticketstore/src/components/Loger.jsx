import { useEffect, useState, useRef } from "react";

export default function Loger({ onLogin, authError, onClose, mode, onRegister }) {

    const ToggleRef = useRef(null);
    const [isClosed, setClose] = useState(false);
    const [password, setPassword] = useState("");
    const [first_name, setfName] = useState("");
    const [last_name, setlName] = useState("");
    const [phone_number, setPhone] = useState("");
    const [role, setRole] = useState("client");
    const [city, setCity] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [whatStyle, setWhatStyle] = useState("password");

    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!form.email.trim()) {
            newErrors.email = "Пошта обовʼязкова";
        }

        if (!form.password.trim()) {
            newErrors.password = "Пароль обовʼязковий";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleRegist = (e) => {
        e.preventDefault();
        onRegister({ email, first_name, last_name, password, phone_number, role, city });
        setClose(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await onLogin(form);
            setClose(true);
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                ToggleRef.current &&
                !ToggleRef.current.contains(e.target)
            ) {
                setClose(true);
                onClose?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);

    }, [onClose]);

    if (isClosed) return null;

    return (
        <div>
            <div className={`modal_loger_${mode}`} ref={ToggleRef}>
                <button className="closer" onClick={() => {
                    setClose(true);
                    onClose?.();
                }}>
                    ✖
                </button>
                <div className="log_section">
                    {mode == "login"
                        ? <form onSubmit={handleSubmit}>
                            <h2>Вхід</h2>

                            <div className="input_section">
                                <input
                                    name="email"
                                    type="text"
                                    placeholder="Пошта"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`inputs ${errors.email ? "error" : ""}`}
                                    autoComplete="username"
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                                <div className="password_coltainer">
                                    <input
                                        name="password"
                                        type={whatStyle}
                                        placeholder="Пароль"
                                        value={form.password}
                                        onChange={handleChange}
                                        className={`inputs ${errors.password ? "error" : ""}`}
                                        autoComplete="current-password"
                                    />
                                    <label>
                                        <input name="type" type="checkbox" className="hidden_checkbox" onChange={() => setWhatStyle(whatStyle === "text" ? "password" : "text")} />
                                        <img src={`svg/${whatStyle}_eye.svg`} alt="closed" />
                                    </label>

                                </div>
                                {errors.password && <span className="error-text">{errors.password}</span>}
                                <button className="button_enter" type="submit">
                                    Увійти
                                </button>
                            </div>
                            {authError && <div className="error">{authError}</div>}
                        </form>

                        : <form onSubmit={handleRegist}>
                            <h2>Реєстрація</h2>
                            <div className="input_section">
                                <input
                                    name="email"
                                    className="inputs"
                                    type="text"
                                    placeholder="Ел. пошта"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <input
                                    name="first_name"
                                    className="inputs"
                                    type="text"
                                    placeholder="Імʼя"
                                    value={first_name}
                                    onChange={(e) => setfName(e.target.value)}
                                />

                                <input
                                    name="last_name"
                                    className="inputs"
                                    type="text"
                                    placeholder="Прізвище"
                                    value={last_name}
                                    onChange={(e) => setlName(e.target.value)}
                                />

                                <input
                                    name="password"
                                    className="inputs"
                                    type="password"
                                    placeholder="Пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />

                                <input
                                    name="phone_number"
                                    className="inputs"
                                    type="text"
                                    placeholder="Номер телефону"
                                    value={phone_number}
                                    onChange={(e) => setPhone(e.target.value)}
                                />

                                <button className="button_sign" type="submit">
                                    Зареєструватись
                                </button>
                            </div>

                        </form>}
                </div>
            </div>
        </div>
    );
}
