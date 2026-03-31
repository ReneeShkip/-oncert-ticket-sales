import { createContext, useState, useEffect, useContext } from "react";
import { normalizeAuthor } from "../utils/normalizedauthors";

export const AuthorContext = createContext();

export const PerformerProvider = ({ children }) => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/organizations")
            .then(res => res.json())
            .then(data => {
                const normalized = normalizeAuthor(data);
                setAuthors(normalized);
            })
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthorContext.Provider value={{ authors, loading, error }}>
            {children}
        </AuthorContext.Provider>
    );
};
export const usePerformers = () => useContext(AuthorContext);