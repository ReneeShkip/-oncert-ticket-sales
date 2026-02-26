import "../pages/css/Alert.css"

export default function Alert({ text, onConfirm, onCancel }) {
    return (
        <div className="al_overlay">
            <div className="alert_section">
                <div className="alert_info">
                    <h1>Увага</h1>
                    <h4>{text}</h4>
                    <div className="al_btns">
                        {onConfirm &&
                            <button onClick={onCancel}>Скасувати</button>
                        }
                        <button className={`ok_btn ${!onConfirm ? "just_info" : ""}`} onClick={onConfirm ?? onCancel}>ОК</button>
                    </div>
                </div>
            </div>
        </div>
    )
}