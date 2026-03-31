import { createContext, useState, useEffect, useContext } from "react";
import { normalizeEvents } from "../utils/normalizeEvent";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/tickets")
            .then(res => res.json())
            .then(data => setEvents(normalizeEvents(data)))
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <EventContext.Provider value={{ events, loading, error }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = () => useContext(EventContext);
