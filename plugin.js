/**
 * @name Власний Сервер
 * @version 1.0.1
 * @description Мій плагін для перегляду фільмів
 * @author Bogdan
 */

(function () {
    'use strict';

    if (window.my_custom_plugin_loaded) return;
    window.my_custom_plugin_loaded = true;

    var backend_url = 'https://tv.bojumbohost.pp.ua';

    function myPlugin() {
        console.log('Plugin: Мій Сервер - запуск логіки');

        // Повідомлення при старті (щоб ти бачив, що він працює)
        setTimeout(function () {
            Lampa.Noty.show('Плагін "Власний Сервер" активний!');
        }, 3000);

        // Слухаємо подію завантаження картки фільму
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                console.log('Plugin: Картка фільму завантажена', e);

                // Спроба знайти контейнер для кнопок декількома методами
                var render = e.object.activity.render();
                var container = render.find('.full-start__buttons');

                // Якщо стандартний шлях не спрацював, шукаємо будь-які кнопки на екрані
                if (container.length === 0) {
                    container = render.find('.full-buttons');
                }

                if (container.length > 0) {
                    // Перевіряємо, чи ми вже не додали кнопку раніше
                    if (container.find('.my-server-btn').length > 0) return;

                    // Створюємо яскраву кнопку
                    var btn = $('<div class="full-start__button selector view--btn my-server-btn" style="background-color: #e50914 !important; color: #fff !important; margin-top: 10px; border: 2px solid white;">🔴 МІЙ СЕРВЕР</div>');

                    btn.on('hover:enter hover:click hover:touch', function () {
                        Lampa.Loading.start();

                        var movie_data = e.data || e.object.data;
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

                    // Додаємо в самий початок списку кнопок
                    container.prepend(btn);
                    console.log('Plugin: Кнопка успішно додана');
                } else {
                    console.error('Plugin: Не вдалося знайти блок .full-start__buttons');
                    Lampa.Noty.show('Помилка: не знайдено блок кнопок');
                }
            }
        });
    }

    if (window.appready) myPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') myPlugin();
    });
})();