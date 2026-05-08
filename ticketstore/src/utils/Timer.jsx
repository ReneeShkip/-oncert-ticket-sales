import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';

export default function Timer({ secondsLeft, user_id }) {
    const { user } = useContext(UserContext);
    const [timeLeft, setTimeLeft] = useState(secondsLeft);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        setTimeLeft(secondsLeft);
        setExpired(false);
    }, [secondsLeft]);

    useEffect(() => {
        if (!timeLeft) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft]);

    if (!user) return null;

    if (expired && user.id == user_id) return <span className='timer'>Бронювання скасовано</span>;
    if (!timeLeft) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return user.id == user_id
        ? <span className='timer'>Часу залишилось: {minutes}:{seconds.toString().padStart(2, '0')}</span>
        : null;
}