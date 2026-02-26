import "../pages/css/notfound.css"
import { useRouteError } from "react-router-dom";

export default function NotFound() {
    const error = useRouteError();

    return (
        <div className="notfound">
            <h1>404</h1>
            <p>
                {error ? error.statusText || error.message : "Сторінка не знайдена"}
            </p>
        </div>
    );
}
