import React, { useRef, useState } from "react";
import "../pages/css/loger.css"
import Loger from "./Loger";
import { NavLink } from "react-router-dom";
export default function Log_in({ isAuth, onLogin, onRegister, onLogout, authError }) {
    const [isOpen, setLogerOpen] = useState(false);
    const [mode, setmode] = useState("login");

    const openLogin = () => {
        setmode("login")
        setLogerOpen(true)
    }

    const openRegistr = () => {
        setmode("register")
        setLogerOpen(true)
    }

    return (
        <div className="personal-popup">

            {isAuth ? (
                <div>
                    <NavLink to={"/profile"}>Особистий кабінет</NavLink>
                    <button onClick={onLogout}>Вийти</button>
                </div>
            ) : (
                <div>
                    <button onClick={openLogin}>Вхід</button>
                    <button onClick={openRegistr}>Реєстрація</button>
                </div>
            )}

            {isOpen && (
                <Loger
                    mode={mode}
                    onClose={() => setLogerOpen(false)}
                    onLogin={onLogin}
                    onRegister={onRegister}
                    authError={authError}
                />
            )}
        </div>
    );
}

