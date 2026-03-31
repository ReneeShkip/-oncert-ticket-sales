import { useState } from "react";

export const useEmail = () => {
    const [error, setError] = useState(null);

    const sendEmail = async ({ user, order }) => {
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, order }),
            });
            const data = await response.json();
            return data.success;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    return { sendEmail, error };
}; 