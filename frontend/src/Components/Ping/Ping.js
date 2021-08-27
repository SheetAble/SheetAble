import React, { useState } from 'react'
import axios from 'axios';

const Ping = () => {
    const [notification, setNotification] = useState('');

    const handlePing = async () => {
        try {
            const response = await axios.get('/api/ping');
            setNotification(`Successful ping with response: ${response.data}`);
        } catch (e) {
            setNotification('Failed to ping');
        }

        setTimeout(() => setNotification(''), 2000);
    }

    return (
        <div>
            <div>
                <p>{notification}</p>

                <button onClick={handlePing}>Ping</button>
            </div>
        </div>
    );
};

export default Ping