import { createContext, useState } from "react";

export const MoreContext = createContext();

export function MoreProvider({ children }) {

    const [lang, setLang] = useState(() => {
        return localStorage.getItem("lang") || "ukr";
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });

    const changeLang = () => {
        const newLang = lang === "ukr" ? "eng" : "ukr";
        setLang(newLang);
        localStorage.setItem("lang", newLang);
    };

    const changeTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <MoreContext.Provider value={{
            lang,
            changeLang,
            theme,
            changeTheme
        }}>
            {children}
        </MoreContext.Provider>
    );
}