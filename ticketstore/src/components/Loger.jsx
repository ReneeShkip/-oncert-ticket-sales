import { useEffect, useState, useRef } from "react";

export default function Loger({ onLogin, authError, onClose, mode, onRegister }) {

    const ToggleRef = useRef(null);
    const [isClosed, setClose] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [first_name, setfName] = useState("");
    const [last_name, setlName] = useState("");
    const [phone_number, setPhone] = useState("");
    const [role, setRole] = useState("client");
    const [city, setCity] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        login: "",
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

        if (!form.login.trim()) {
            newErrors.login = "Логін обовʼязковий";
        }

        if (!form.password.trim()) {
            newErrors.password = "Пароль обовʼязковий";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleRegist = (e) => {
        e.preventDefault();
        onRegister({ login, first_name, last_name, password, phone_number, role, email, city });
        setClose(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onLogin(form);
        if (!validate()) return;

        onLogin(form);
        setClose(true);
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
                                    name="login"
                                    type="text"
                                    placeholder="Логін"
                                    value={form.login}
                                    onChange={handleChange}
                                    className={`inputs ${errors.login ? "error" : ""}`}
                                    autoComplete="username"
                                />
                                {errors.login && <span className="error-text">{errors.login}</span>}
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Пароль"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`inputs ${errors.password ? "error" : ""}`}
                                    autoComplete="current-password"
                                />
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
                                    name="login"
                                    className="inputs"
                                    type="text"
                                    placeholder="Логін"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
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