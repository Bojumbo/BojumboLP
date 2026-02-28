/**
 * @name Власний Сервер
 * @version 1.0.3
 * @description Виправлено для нового лейауту Lampa
 * @author Bogdan
 */

(function () {
    'use strict';

    if (window.my_custom_plugin_loaded) return;
    window.my_custom_plugin_loaded = true;

    var backend_url = 'https://tv.bojumbohost.pp.ua';

    function myPlugin() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();

                // ШУКАЄМО ТВОЮ НОВУ ПАНЕЛЬ КНОПОК
                var container = render.find('.full-start-new__buttons');

                // Якщо не знайшли нову, шукаємо старі (про всяк випадок)
                if (container.length === 0) {
                    container = render.find('.full-start__buttons, .full-buttons');
                }

                if (container.length > 0) {
                    if (container.find('.my-server-btn').length > 0) return;

                    // Створюємо кнопку (зробив її в стилі Lampa, але з червоним акцентом)
                    var btn = $('<div class="full-start__button selector view--btn my-server-btn" style="background-color: #e50914 !important; color: #fff !important;">Мій Сервер</div>');

                    btn.on('hover:enter hover:click hover:touch', function () {
                        Lampa.Loading.start();

                        var movie_data = e.object.data || e.data;
                        var title = movie_data.title || movie_data.name;
                        var api_url = backend_url + '/api/stream?id=' + movie_data.id + '&title=' + encodeURIComponent(title);

                        var network = new Lampa.Reguest();
                        network.silent(api_url, function (json) {
                            Lampa.Loading.stop();
                            if (json.url) {
                                Lampa.Player.play({
                                    url: json.url,
                                    title: title,
                                    timeline: movie_data
                                });
                            } else {
                                Lampa.Noty.show('Відео не знайдено');
                            }
                        }, function (a, c) {
                            Lampa.Loading.stop();
                            Lampa.Noty.show('Помилка сервера: ' + network.errorDecode(a, c));
                        });
                    });

                    // Додаємо кнопку в кінець списку кнопок
                    container.append(btn);

                    // Обов'язково змушуємо Lampa перерахувати навігацію пультом/клавіатурою
                    Lampa.Controller.enable('full');
                }
            }
        });
    }

    if (window.appready) myPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') myPlugin();
    });
})();