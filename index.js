const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const winston = require('winston'); // Optional: For advanced logging
const cors = require('cors');
const app = express();
const port = 3000;

// Configure Winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

app.use(bodyParser.json());
app.use(cors());

// Use bodyParser middleware
app.use(bodyParser.json());
app.post('/save', async (req, res) => {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
                addressdetails: 1
            }
        });

        const address = response.data.address;
        if (address) {
            const street = address.road || address.street;
            const city = address.city || address.town || address.village;
            const formattedAddress = `${street || ''}, ${city || ''}`;

            // Log address information
            logger.info(`Address: ${formattedAddress}`);
            console.log(`Address: ${formattedAddress}`);

            res.status(200).json({
                address: formattedAddress,
                street,
                city,
                latitude,
                longitude
            });
        } else {
            res.status(404).json({ error: 'Location not found' });
        }
    } catch (error) {
        logger.error('Error fetching location:', error);
        console.error('Error fetching location:', error);
        res.status(500).json({ error: 'Error fetching location' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
