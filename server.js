const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();
const port = 3005;

app.use(cors());

// Імітація реального браузера
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://google.com'
};

// Функція для очищення назви: залишаємо лише слова та цифри
function cleanQuery(str) {
    if (!str) return "";
    return str.replace(/[^a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getIframe(url, siteName) {
    try {
        console.log(`[${siteName}] Заходимо на сторінку: ${url}`);
        const res = await axios.get(url, { headers: HEADERS, timeout: 7000 });
        const $ = cheerio.load(res.data);

        // Шукаємо iframe у різних можливих блоках
        let iframe = $('#video-player iframe').attr('src') ||
            $('.video-box iframe').attr('src') ||
            $('iframe[src*="vid"]').attr('src') ||
            $('iframe[src*="player"]').attr('src');

        if (iframe) {
            if (iframe.startsWith('//')) iframe = 'https:' + iframe;
            console.log(`[${siteName}] Плеєр знайдено: ${iframe}`);
            return iframe;
        }
        return null;
    } catch (e) {
        console.log(`[${siteName}] Помилка завантаження сторінки: ${e.message}`);
        return null;
    }
}

async function searchOnSite(baseUrl, query, siteName) {
    try {
        const cleaned = cleanQuery(query);
        console.log(`[${siteName}] Пошуковий запит: ${cleaned}`);

        // Більшість DLE сайтів підтримують такий формат пошуку
        const searchUrl = `${baseUrl}/index.php?do=search&subaction=search&story=${encodeURIComponent(cleaned)}`;

        const res = await axios.get(searchUrl, { headers: HEADERS, timeout: 7000 });
        const $ = cheerio.load(res.data);

        // Шукаємо посилання на результат (UAKino - .movie-item, Eneyida - .shortitem)
        const link = $('.movie-item a, .shortitem a, .movie-title a, .short-story a').first().attr('href');

        if (!link) {
            console.log(`[${siteName}] Результатів не знайдено.`);
            return null;
        }

        return await getIframe(link, siteName);
    } catch (e) {
        console.log(`[${siteName}] Помилка пошуку: ${e.message}`);
        return null;
    }
}

app.get('/api/search', async (req, res) => {
    const { q, ua_title } = req.query;
    console.log(`\n--- НОВИЙ ЗАПИТ: ${q} ---`);

    let results = [];
    const sites = [
        { name: 'UAKino', url: 'https://uakino.best' },
        { name: 'Eneyida', url: 'https://eneyida.tv' }
    ];

    for (let site of sites) {
        // Пробуємо оригінальну назву
        let videoUrl = await searchOnSite(site.url, q, site.name);

        // Якщо не знайшли за оригіналом, спробуємо за UA назвою
        if (!videoUrl && ua_title && ua_title !== q) {
            console.log(`[${site.name}] Спроба №2 за UA назвою: ${ua_title}`);
            videoUrl = await searchOnSite(site.url, ua_title, site.name);
        }

        if (videoUrl) {
            results.push({
                title: `${site.name} (UA)`,
                url: videoUrl,
                quality: 'HD'
            });
        }
    }

    console.log(`Всього знайдено джерел: ${results.length}`);
    res.json(results);
});

app.get('/plugin.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.sendFile(path.join(__dirname, 'plugin.js'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`UA Search Server v2.0 started on port ${port}`);
});