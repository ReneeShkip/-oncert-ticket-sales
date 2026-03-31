import { useState, useEffect } from 'react';

export default function Timer({ secondsLeft }) {
    const [timeLeft, setTimeLeft] = useState(secondsLeft);

    useEffect(() => {
        setTimeLeft(secondsLeft);
    }, [secondsLeft]);

    useEffect(() => {
        if (!timeLeft) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft]);

    if (!timeLeft) return <span>Бронювання скасовано</span>;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return <span className='timer'>Часу залишилось: {minutes}:{seconds.toString().padStart(2, '0')}</span>;
}