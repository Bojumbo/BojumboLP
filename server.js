const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();
const port = 3005;

app.use(cors());

async function parseUAKino(title) {
    try {
        const searchUrl = `https://uakino.best/index.php?do=search&subaction=search&story=${encodeURIComponent(title)}`;
        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 8000
        });

        const $ = cheerio.load(response.data);
        const firstLink = $('.movie-item a').first().attr('href');

        if (!firstLink) return [];

        const moviePage = await axios.get(firstLink, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $movie = cheerio.load(moviePage.data);

        let iframeSrc = $movie('#video-player iframe').attr('src') || $movie('iframe[src*="vid"]').attr('src');

        if (iframeSrc) {
            if (iframeSrc.startsWith('//')) iframeSrc = 'https:' + iframeSrc;
            return [{
                title: 'UAKino (Українська озвучка)',
                url: iframeSrc,
                quality: 'HD'
            }];
        }
        return [];
    } catch (e) {
        console.error('Парсинг не вдався:', e.message);
        return [];
    }
}

app.get('/api/search', async (req, res) => {
    try {
        const title = req.query.title;
        if (!title) return res.json([]);
        const results = await parseUAKino(title);
        res.json(results);
    } catch (err) {
        res.json([]);
    }
});

app.get('/plugin.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.sendFile(path.join(__dirname, 'plugin.js'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on Node 20, port ${port}`);
});