import React, { useState, useEffect } from 'react';

const Timer = ({ startDate }: { startDate: string | Date }) => {
    const [elapsed, setElapsed] = useState('00:00:00');

    useEffect(() => {
        if (!startDate) return;

        const start = new Date(startDate).getTime();

        if (isNaN(start)) {
            setElapsed('00:00:00');
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = now - start;

            if (diff < 0) {
                setElapsed('00:00:00');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsed(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [startDate]);

    return (
        <span className="font-mono tabular-nums tracking-widest text-xl font-black text-blue-800 drop-shadow-sm min-w-[100px] text-center inline-block">
            {elapsed}
        </span>
    );
};

export default Timer;
