function startSessionCountdown(timeout, onTimeout) {
    let countdownInterval = null;
    let lastTimestamp = Date.now();
    let remainingTime = timeout;

    const stopCountdown = () => {
        if (countdownInterval) clearInterval(countdownInterval);
    };

    const start = () => {
        stopCountdown();

        countdownInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = lastTimestamp ? now - lastTimestamp : 1000;
            lastTimestamp = now;

            remainingTime -= elapsed;

            if (remainingTime <= 0) {
                stopCountdown();
                if (onTimeout) onTimeout();
            }
        }, 1000);
    }

    start();

    return {
        stop: stopCountdown,
        getRemainingTime: () => remainingTime,
    };
}

export default startSessionCountdown;