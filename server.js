const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3005;

app.use(cors());

// Ендпоінт для отримання посилання на відео
app.get('/api/stream', (req, res) => {
    const { id, title } = req.query;
    console.log(`Запит: ${title} (ID: ${id})`);

    // ТУТ БУДЕ ТВОЯ ЛОГІКА. Поки що тестове відео.
    res.json({
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: '1080p'
    });
});

// Ендпоінт, щоб віддавати сам файл плагіна
app.get('/plugin.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'plugin.js'));
});

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});