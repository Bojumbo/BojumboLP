/**
 * @name Власний Сервер
 * @version 1.0.0
 * @description Мій плагін для перегляду фільмів
 * @author Bogdan
 */

(function () {
    'use strict';

    // Запобіжник від подвійного завантаження плагіна (щоб не було двох однакових кнопок)
    if (window.my_custom_plugin_loaded) return;
    window.my_custom_plugin_loaded = true;

    // Твій домен через Cloudflare
    var backend_url = 'https://tv.bojumbohost.pp.ua';

    function myPlugin() {
        // Слухаємо подію відкриття картки фільму або серіалу
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {

                // Знаходимо блок, де лежать кнопки (Трейлер, Торенти і т.д.)
                var buttons = e.object.activity.render().find('.full-start__buttons');

                // Якщо наша кнопка вже є - не додаємо другу
                if (buttons.find('.my-server-btn').length > 0) return;

                // Створюємо кнопку (додав червоний колір, щоб ти одразу її помітив)
                var btn = $('<div class="full-start__button selector view--btn my-server-btn" style="background-color: #b71c1c; margin-top: 10px;">Мій Сервер</div>');

                // Дія при натисканні на кнопку
                btn.on('hover:enter hover:click hover:touch', function () {
                    Lampa.Loading.start();

                    // Lampa іноді зберігає назву в title (фільми), а іноді в name (серіали)
                    var title = e.object.title || e.object.name;
                    var id = e.object.id;

                    // Формуємо запит до твого бекенду
                    var api = backend_url + '/api/stream?id=' + id + '&title=' + encodeURIComponent(title);

                    var network = new Lampa.Reguest();
                    network.silent(api, function (json) {
                        Lampa.Loading.stop();

                        // Якщо сервер повернув відео
                        if (json.url) {
                            var video = {
                                url: json.url,
                                title: title,
                                timeline: e.object // для збереження часу перегляду
                            };
                            Lampa.Player.play(video);
                        } else {
                            Lampa.Noty.show('Відео не знайдено на сервері');
                        }
                    }, function (a, c) {
                        Lampa.Loading.stop();
                        Lampa.Noty.show('Помилка сервера: ' + network.errorDecode(a, c));
                    });
                });

                // Додаємо кнопку на екран
                buttons.append(btn);
            }
        });
    }

    // Запуск плагіна
    if (window.appready) myPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') myPlugin();
    });

})();