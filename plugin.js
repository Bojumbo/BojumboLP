(function () {
    'use strict';

    var backend_url = 'https://tv.bojumbohost.pp.ua';

    function myPlugin() {
        // Показуємо повідомлення, щоб ти знав, що код взагалі запустився
        setTimeout(function () {
            Lampa.Noty.show('Мій плагін успішно завантажено!');
        }, 2000);

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();

                // Перевіряємо різні варіанти блоку кнопок (залежить від версії Lampa)
                var container = render.find('.full-start__buttons');

                if (container.length > 0 && !container.find('.my-server-btn').length) {
                    var btn = $('<div class="full-start__button selector view--btn my-server-btn" style="background-color: #ff0000 !important; color: #fff; margin-top: 10px; padding: 10px; border-radius: 5px;">🔴 МІЙ СЕРВЕР</div>');

                    btn.on('hover:enter hover:click hover:touch', function () {
                        Lampa.Loading.start();

                        var movie = e.data || e.object.data;
                        var title = movie.title || movie.name;
                        var api = backend_url + '/api/stream?id=' + movie.id + '&title=' + encodeURIComponent(title);

                        var network = new Lampa.Reguest();
                        network.silent(api, function (json) {
                            Lampa.Loading.stop();
                            if (json.url) {
                                Lampa.Player.play({
                                    url: json.url,
                                    title: title,
                                    timeline: movie
                                });
                            } else {
                                Lampa.Noty.show('Відео не знайдено');
                            }
                        }, function (a, c) {
                            Lampa.Loading.stop();
                            Lampa.Noty.show('Помилка сервера: ' + network.errorDecode(a, c));
                        });
                    });

                    container.append(btn);
                }
            }
        });
    }

    if (window.appready) myPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') myPlugin();
    });
})();