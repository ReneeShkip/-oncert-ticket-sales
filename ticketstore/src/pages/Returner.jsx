import { NavLink } from "react-router-dom";
import "./css/profile.css"
export default function Returner() {
    return (
        <div className="alternative">
            <img src="svg/return.svg" alt="return" />
            <h2>Дякуємо за замовлення</h2>
            <NavLink to="/">Назад до каталогу</NavLink>
        </div>
    )
}