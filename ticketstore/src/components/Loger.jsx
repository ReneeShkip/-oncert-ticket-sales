import { useEffect, useState, useRef, useContext } from "react";
import { useEmail } from "../utils/SendMail"
import { MoreContext } from "../context/MoreContext";

export default function Loger({ onLogin, authError, onClose, mode, onRegister }) {

    const ToggleRef = useRef(null);
    const [isClosed, setClose] = useState(false);
    const [password, setPassword] = useState("");
    const [first_name, setfName] = useState("");
    const [last_name, setlName] = useState("");
    const [phone_number, setPhone] = useState("");
    const [role, setRole] = useState("client");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [whatStyle, setWhatStyle] = useState("password");
    const { lang } = useContext(MoreContext);
    const { validateEmail } = useEmail();
    const [coder, setCoder] = useState("");
    const [errorsFields, setErrorsFields] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        password: "",
        email: ""
    })

    const translator = {
        ukr: {
            Enter: "Вхід",
            Sign: "Реєстрація",
            CodeTitle: "Підтвердіть",
            error: "Невірна пошта або пароль",
            info: {
                email: "Пошта",
                fName: "Ім'я",
                lName: "Прізвище",
                phone: "Телефон",
                password: "Пароль",
                varify: "Код підтвердження",
                Send: "Надіслати",
                resend: "Надіслати повторно",
                infoCode: "Ми вам надіслали код, перевірте пошту"
            }
        },
        eng: {
            Enter: "Log in",
            Sign: "Sign up",
            CodeTitle: "Verify",
            error: "Incorrect email or password",
            info: {
                email: "Email",
                fName: "Name",
                lName: "Last name",
                phone: "Phone",
                password: "Password",
                varify: "Varification code",
                Send: "Send",
                resend: "Send again",
                infoCode: "We sent you a code. Please, check your email"
            }
        }
    }


    const [formLog, setFormLog] = useState({
        email: "",
        password: ""
    });

    const [form, setForm] = useState({
        email: "", first_name: "", last_name: "", phone_number: "", password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrorsFields(prev => ({ ...prev, [name]: "" }));
    };

    const handleChangeLog = (e) => {
        const { name, value } = e.target;
        setFormLog(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formLog.email.trim()) {
            newErrors.email = lang === "ukr" ? "Пошта обовʼязкова" : "Mail is required";
        }

        if (!formLog.password.trim()) {
            newErrors.password = lang === "ukr" ? "Пароль обовʼязковий" : "Password required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const checkValid = () => {

        const newErrors = {}
        const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/
        const passwordRegex = /^(?=.*\D).{8,}$/;
        const phoneRegex = /^(\+?380|0)\d{9}$/;
        if (!form.email.trim()) {
            newErrors.email = lang === "ukr" ? "Пошта обовʼязкова" : "Mail is required";
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = lang === "ukr" ? "Пошта некоректна" : "Mail is not valid";
        }

        if (!form.first_name.trim()) {
            newErrors.first_name = lang === "ukr" ? "Ім'я обовʼязкове" : "Name is required";
        }

        if (!form.last_name.trim()) {
            newErrors.last_name = lang === "ukr" ? "Прізвище обовʼязкове" : "Last name is required";
        }

        if (!form.phone_number.trim()) {
            newErrors.phone_number = lang === "ukr" ? "Номер телефону обов'язковий" : "Phone number required";
        } else if (!phoneRegex.test(form.phone_number)) {
            newErrors.phone_number = lang === "ukr" ? "Номер не в правильному форматі" : "The number is not in the correct format";
        }

        if (!form.password.trim()) {
            newErrors.password = lang === "ukr" ? "Пароль обовʼязковий" : "Password required";
        } else if (!passwordRegex.test(form.password)) {
            newErrors.password = lang === "ukr" ? "Мінімум 8 символів і один спец-символ" : "Minimum 8 characters and one special character";
        }

        setErrorsFields(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const [code, setCode] = useState(0);

    const handleRegist = (e) => {
        e.preventDefault();
        if (!checkValid()) {
            return;
        }
        const newCode = Math.floor(10000 + Math.random() * 90000);

        setValid(true);
        setCode(newCode);

        validateEmail({ email: form.email, code: newCode });
    };

    const [valid, setValid] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await onLogin(formLog);
            setClose(true);
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    const handleValid = async (e) => {
        e.preventDefault();
        if (code === Number(form.coder)) {
            onRegister({
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
                password: form.password,
                phone_number: form.phone_number,
                role,
            });
            setClose(true);
        } else {
            setErrors({ coder: "Невірний код підтвердження" });
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
                        ? <form onSubmit={handleSubmit} autoComplete="off">
                            <h2>{translator?.[lang].Enter}</h2>

                            <div className="input_section">
                                <input
                                    name="email"
                                    type="text"
                                    placeholder={translator?.[lang].info.email}
                                    value={formLog.email}
                                    onChange={handleChangeLog}
                                    className={`inputs ${errors.email ? "error" : ""}`}
                                    autoComplete="username"
                                    readOnly
                                    onFocus={e => e.target.removeAttribute('readonly')}
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                                <div className="password_coltainer">
                                    <input
                                        name="password"
                                        type={whatStyle}
                                        placeholder={translator?.[lang].info.password}
                                        value={formLog.password}
                                        onChange={handleChangeLog}
                                        className={`inputs ${errors.password ? "error" : ""}`}
                                        autoComplete="current-password"
                                        style={{ width: "220px" }}
                                        readOnly
                                        onFocus={e => e.target.removeAttribute('readonly')}
                                    />
                                    <label>
                                        <input name="type" type="checkbox" className="hidden_checkbox" onChange={() => setWhatStyle(whatStyle === "text" ? "password" : "text")} />
                                        <img src={`/svg/${whatStyle}_eye.svg`} alt="eye toggle" />
                                    </label>

                                </div>
                                {errors.password && <span className="error-text">{errors.password}</span>}
                                <button className="button_enter" type="submit">
                                    {translator?.[lang].Enter}
                                </button>
                            </div>
                            {authError && <div className="error">{translator?.[lang].error}</div>}
                        </form>

                        : !valid ?
                            <form onSubmit={handleRegist} autoComplete="off">
                                <h2>{translator?.[lang].Sign}</h2>
                                <div className="input_container">
                                    <div className="input_section">
                                        <div className="with_validation">
                                            <input
                                                name="email"
                                                className={`inputs ${errorsFields.email ? "wrong_valid" : ""}`}
                                                type="email"
                                                placeholder={translator?.[lang].info.email}
                                                value={form.email}
                                                onChange={handleChange}
                                                readOnly
                                                onFocus={e => e.target.removeAttribute('readonly')}
                                                autoComplete="off"
                                            />
                                            <p>{errorsFields.email}</p>
                                        </div>
                                        <div className="with_validation">
                                            <input
                                                name="first_name"
                                                className={`inputs ${errorsFields.first_name ? "wrong_valid" : ""}`}
                                                type="text"
                                                placeholder={translator?.[lang].info.fName}
                                                value={form.first_name}
                                                readOnly
                                                onFocus={e => e.target.removeAttribute('readonly')}
                                                onChange={handleChange}

                                            />
                                            <p>{errorsFields.first_name}</p>
                                        </div>
                                        <div className="with_validation">
                                            <input
                                                name="last_name"
                                                className={`inputs ${errorsFields.last_name ? "wrong_valid" : ""}`}
                                                type="text"
                                                placeholder={translator?.[lang].info.lName}
                                                value={form.last_name}
                                                onChange={handleChange}
                                            />
                                            <p>{errorsFields.last_name}</p>
                                        </div>
                                    </div>
                                    <div className="input_section">
                                        <div className="with_validation">
                                            <div className="password_coltainer">
                                                <input
                                                    name="password"
                                                    className={`inputs ${errorsFields.password ? "wrong_valid" : ""}`}
                                                    type={whatStyle}
                                                    placeholder={translator?.[lang].info.password}
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    autoComplete="current-password"
                                                />
                                                <label>
                                                    <input name="type" type="checkbox" className="hidden_checkbox" onChange={() => setWhatStyle(whatStyle === "text" ? "password" : "text")} />
                                                    <img src={`/svg/${whatStyle}_eye.svg`} alt="eye toggle" />
                                                </label>
                                            </div>
                                            <p>{errorsFields.password}</p>
                                        </div>
                                        <div className="with_validation">
                                            <input
                                                name="phone_number"
                                                className={`inputs phone ${errorsFields.phone_number ? "wrong_valid" : ""}`}
                                                type="text"
                                                placeholder={translator?.[lang].info.phone}
                                                value={form.phone_number}
                                                onChange={handleChange}
                                            />
                                            <p>{errorsFields.phone_number}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="button_sign" type="submit">
                                    {translator?.[lang].Sign}
                                </button>

                            </form>
                            :
                            <form onSubmit={handleValid}>
                                <h2>{translator?.[lang].CodeTitle}</h2>
                                <div className="input_section">
                                    <h4>{translator?.[lang].info.infoCode}</h4>
                                    <input
                                        name="coder"
                                        type="text"
                                        placeholder={translator?.[lang].info.varify}
                                        value={form.coder}
                                        onChange={handleChange}
                                        className={`inputs`}
                                    />
                                </div>
                                <button className="button_sign" type="submit">{translator?.[lang].info.Send}</button>
                                <div className="s-container">
                                    <button className="simple" onClick={handleRegist}>{translator?.[lang].info.resend}</button>
                                </div>
                            </form>
                    }
                </div>
            </div>
        </div>
    );
}
