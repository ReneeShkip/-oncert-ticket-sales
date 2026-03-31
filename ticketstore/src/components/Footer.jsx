import { useContext } from "react"
import "../App.css"
import { MoreContext } from "../context/MoreContext"

export default function Footer() {
    const { lang } = useContext(MoreContext);
    const translator = {
        ukr: "Цей сайт є виключно навчальним проєктом",
        eng: "This site is an educational project only"
    }
    return (
        <footer>
            <div className="footer_info">
                <div className="foot_icons">
                    <a href="https://t.me/gingers_hut"><img src="/img/logo/telegram.png" alt="telegram" /></a>
                    <a href="https://www.instagram.com/saber_sable?igsh=MWR0ZnRlZGd2aGY2bg=="><img src="/img/logo/instagram.png" alt="instagram" /></a>
                    <a href="https://www.tiktok.com/@gingers_hut?_r=1&_t=ZM-93DHGu9O5NL"><img src="/img/logo/tiktok.png" alt="tiktok" /></a>
                </div>
                <h5>{translator?.[lang]}</h5>
            </div >
        </footer >
    )
}

