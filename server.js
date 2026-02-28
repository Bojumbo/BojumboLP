const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3005;

// Дозволяємо CORS (Cross-Origin Resource Sharing)
// Це критично важливо для того, щоб Lampa могла робити запити до твого сервера
app.use(cors());

// 1. Ендпоінт для отримання посилання на відео
// Сюди Lampa звертається, коли ти натискаєш кнопку "Мій Сервер"
app.get('/api/stream', (req, res) => {
    const { id, title } = req.query;
    console.log(`Запит на відео: ${title} (ID: ${id})`);

    // Зараз ми віддаємо тестовий мультик Big Buck Bunny.
    // Коли ти захочеш додати реальні фільми, ти зміниш цей блок.
    res.json({
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: '1080p',
        subtitles: []
    });
});

// 2. Ендпоінт, який віддає сам файл плагіна (plugin.js)
// Lampa завантажує його один раз при старті програми
app.get('/plugin.js', (req, res) => {
    const filePath = path.join(__dirname, 'plugin.js');

    // Встановлюємо правильний MIME-тип, щоб Lampa розпізнала файл як JavaScript код
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');

    res.sendFile(filePath);
});

// 3. Запуск сервера
app.listen(port, () => {
    console.log(`========================================`);
    console.log(`Lampa Backend Server is running!`);
    console.log(`Port: ${port}`);
    console.log(`Domain: https://tv.bojumbohost.pp.ua`);
    console.log(`Plugin URL: https://tv.bojumbohost.pp.ua/plugin.js`);
    console.log(`========================================`);
});