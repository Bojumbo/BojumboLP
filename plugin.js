(function () {
    'use strict';

    // ВСТАВ ТУТ СВІЙ ДОМЕН CLOUDFLARE
    var backend_url = 'https://tv.bojumbohost.pp.ua';

    function myPlugin() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var btn = $('<div class="full-start__button selector view--btn" style="margin-top: 10px;">BojumboLP</div>');

                btn.on('hover:enter hover:click hover:touch', function () {
                    Lampa.Loading.start();
                    var network = new Lampa.Reguest();
                    // Звертаємося до твого бекенду
                    var api = backend_url + '/api/stream?id=' + e.object.id + '&title=' + encodeURIComponent(e.object.title);

                    network.silent(api, function (json) {
                        Lampa.Loading.stop();
                        if (json.url) {
                            Lampa.Player.play({
                                url: json.url,
                                title: e.object.title,
                                timeline: e.object
                            });
                        } else {
                            Lampa.Noty.show('Відео не знайдено');
                        }
                    }, function (a, c) {
                        Lampa.Loading.stop();
                        Lampa.Noty.show('Помилка: ' + network.errorDecode(a, c));
                    });
                });
                e.object.activity.render().find('.full-start__buttons').append(btn);
            }
        });
    }

    if (window.appready) myPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') myPlugin();
    });
})();