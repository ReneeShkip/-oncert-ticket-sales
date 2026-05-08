import React, { useContext, useRef, useState } from "react";
import "../pages/css/loger.css"
import Loger from "./Loger";
import { NavLink } from "react-router-dom";
import { MoreContext } from "../context/MoreContext";
export default function Log_in({ isAuth, onLogin, onRegister, onLogout, authError }) {
    const [isOpen, setLogerOpen] = useState(false);
    const [mode, setmode] = useState("login");
    const { lang } = useContext(MoreContext)

    const openLogin = () => {
        setmode("login")
        setLogerOpen(true)
    }

    const openRegistr = () => {
        setmode("register")
        setLogerOpen(true)
    }

    const translator = {
        ukr: {
            Enter: "Вхід",
            Sign: "Реєстрація",
            Personal: "Особистий кабінет",
            Out: "Вийти"
        },
        eng: {
            Enter: "Log in",
            Sign: "Sign up",
            Personal: "My account",
            Out: "Log out"
        }
    }

    return (
        <div className="personal-popup">

            {isAuth ? (
                <div>
                    <NavLink to={"/profile"}>{translator?.[lang].Personal}</NavLink>
                    <button onClick={onLogout}>{translator?.[lang].Out}</button>
                </div>
            ) : (
                <div>
                    <button onClick={openLogin}>{translator?.[lang].Enter}</button>
                    <button onClick={openRegistr}>{translator?.[lang].Sign}</button>
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

