import { createContext, useState, useEffect, useContext } from "react";
import { useLocation } from 'react-router-dom';
import { normalizeEvents } from "../utils/normalizeEvent";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const fetchEvents = () => {
        setLoading(true);
        fetch("http://localhost:5000/tickets")
            .then(res => res.json())
            .then(data => setEvents(normalizeEvents(data)))
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchEvents();
    }, [location.pathname]);

    const cancelDate = (dateId) => {
        setEvents(prev => prev.map(event => ({
            ...event,
            tickets: event.tickets.map(t =>
                t.date_id === dateId ? { ...t, status: 'Скасовано' } : t
            )
        })));
    };



    return (
        <EventContext.Provider value={{ events, loading, error, cancelDate, refetch: fetchEvents }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = () => useContext(EventContext);
