const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3005;

// Дозволяємо запити з будь-яких джерел (CORS)
app.use(cors());

// Ендпоінт для отримання посилання на відео
app.get('/api/stream', (req, res) => {
    const { id, title } = req.query;
    console.log(`Запит на відео: ${title} (ID: ${id})`);

    // Тут ми повертаємо тестове відео (Big Buck Bunny)
    // У майбутньому тут буде твоя логіка пошуку фільмів
    res.json({
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: '1080p',
        subtitles: []
    });
});

// Ендпоінт, щоб віддавати сам файл плагіна (plugin.js)
app.get('/plugin.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'plugin.js'));
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});