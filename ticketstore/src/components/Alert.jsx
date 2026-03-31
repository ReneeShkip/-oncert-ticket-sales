import "../pages/css/Alert.css"
import { useContext } from "react";
import { MoreContext } from "../context/MoreContext";

export default function Alert({ text, onConfirm, onCancel }) {
    const { lang, theme } = useContext(MoreContext);
    const translator = {
        ukr: {

            war: "Увага",
            btn: "Скасувати"

        },
        eng: {
            war: "Warning",
            btn: "Скасувати"
        }
    }
    return (
        <div className="al_overlay">
            <div className="alert_section">
                <div className="alert_info">
                    <h1>{translator?.[lang].war}</h1>
                    <h4>{text}</h4>
                    <div className="al_btns">
                        {onConfirm &&
                            <button onClick={onCancel}>{translator?.[lang].btn}</button>
                        }
                        <button className={`ok_btn ${!onConfirm ? "just_info" : ""}`} onClick={onConfirm ?? onCancel}>ОК</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
