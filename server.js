const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();
const port = 3005;

app.use(cors());

const UA_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function parseUAKino(title) {
    try {
        const searchUrl = `https://uakino.best/index.php?do=search&subaction=search&story=${encodeURIComponent(title)}`;
        const searchRes = await axios.get(searchUrl, {
            headers: { 'User-Agent': UA_USER_AGENT },
            timeout: 5000
        });
        const $search = cheerio.load(searchRes.data);

        const firstLink = $search('.movie-item a').first().attr('href');
        if (!firstLink) return [];

        const movieRes = await axios.get(firstLink, { headers: { 'User-Agent': UA_USER_AGENT } });
        const $movie = cheerio.load(movieRes.data);

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
        console.log('Помилка парсингу UAKino:', e.message);
        return [];
    }
}

app.get('/api/search', async (req, res) => {
    const { title } = req.query;
    if (!title) return res.json([]);

    const results = await parseUAKino(title);
    res.json(results);
});

app.get('/plugin.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.sendFile(path.join(__dirname, 'plugin.js'));
});

app.listen(port, () => console.log(`UA PRO Server on ${port}`));