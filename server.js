const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const app = express();
const port = 3005;

app.use(cors());

// Функція для пошуку українського контенту через балансер
async function getUAVideo(tmdbId) {
    try {
        // Використовуємо один із найбільш стабільних балансерів з UA озвучкою
        // Collaps / Ashdi часто мають прямі доріжки
        const url = `https://api.bhfwaa97.org/embed/movie/${tmdbId}`;

        // Перевіряємо, чи взагалі доступний цей фільм (робимо легкий запит)
        await axios.get(url, { timeout: 3000 });

        return {
            title: 'Українська озвучка (Мультібалансер)',
            url: url,
            quality: '1080p'
        };
    } catch (e) {
        console.log(`Фільм з ID ${tmdbId} не знайдено на балансері`);
        return null;
    }
}

app.get('/api/search', async (req, res) => {
    const { id, title } = req.query;
    console.log(`Пошук за TMDB ID: ${id} (${title})`);

    let results = [];

    // Шукаємо за ID (це найнадійніший спосіб)
    const video = await getUAVideo(id);

    if (video) {
        results.push(video);
    }

    res.json(results);
});

app.get('/plugin.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.sendFile(path.join(__dirname, 'plugin.js'));
});

app.listen(port, '0.0.0.0', () => console.log(`UA PRO Server active on port ${port}`));