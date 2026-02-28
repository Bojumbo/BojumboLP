const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();
const port = 3005;

app.use(cors());

const UA_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function cleanTitle(str) {
    if (!str) return "";
    // Прибираємо спецсимволи, залишаємо тільки букви, цифри та пробіли
    return str.replace(/[:.,!?-]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getIframeFromUrl(url) {
    try {
        const res = await axios.get(url, { headers: { 'User-Agent': UA_USER_AGENT }, timeout: 5000 });
        const $ = cheerio.load(res.data);
        let iframe = $('#video-player iframe').attr('src') || $('iframe[src*="vid"]').attr('src') || $('iframe[src*="player"]').attr('src');
        if (iframe && iframe.startsWith('//')) iframe = 'https:' + iframe;
        return iframe;
    } catch (e) { return null; }
}

async function searchSite(baseUrl, query) {
    try {
        const searchUrl = `${baseUrl}/index.php?do=search&subaction=search&story=${encodeURIComponent(cleanTitle(query))}`;
        const res = await axios.get(searchUrl, { headers: { 'User-Agent': UA_USER_AGENT }, timeout: 5000 });
        const $ = cheerio.load(res.data);

        // Знаходимо перше посилання на фільм
        // Для UAKino це .movie-item a, для Eneyida це .shortitem a або подібне
        const link = $('.movie-item a, .shortitem a, .movie-title a').first().attr('href');
        if (!link) return null;

        return await getIframeFromUrl(link);
    } catch (e) { return null; }
}

app.get('/api/search', async (req, res) => {
    const { q, ua_title } = req.query; // q - оригінальна назва
    console.log(`Пошук за оригіналом: ${q}`);

    let results = [];

    // Список сайтів для парсингу
    const sites = [
        { name: 'UAKino', url: 'https://uakino.best' },
        { name: 'Eneyida', url: 'https://eneyida.tv' }
    ];

    for (let site of sites) {
        // Спочатку шукаємо за оригіналом (англійською)
        let videoUrl = await searchSite(site.url, q);

        // Якщо не знайшли, пробуємо за українською назвою
        if (!videoUrl && ua_title) {
            videoUrl = await searchSite(site.url, ua_title);
        }

        if (videoUrl) {
            results.push({
                title: `${site.name} (UA Dub)`,
                url: videoUrl,
                quality: 'HD'
            });
        }
    }

    res.json(results);
});

app.get('/plugin.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.sendFile(path.join(__dirname, 'plugin.js'));
});

app.listen(port, '0.0.0.0', () => console.log(`UA Search (Original Title Priority) on port ${port}`));