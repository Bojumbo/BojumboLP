/**
 * @name UA Online Pro
 * @version 2.0.0
 */
(function () {
    'use strict';
    if (window.ua_plugin_loaded) return;
    window.ua_plugin_loaded = true;

    var backend_url = 'https://tv.bojumbohost.pp.ua';

    function myUA_Plugin() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();
                var container = render.find('.full-start-new__buttons, .full-start__buttons');

                if (container.length > 0 && !container.find('.ua-online-btn').length) {
                    var btn = $('<div class="full-start__button selector view--btn ua-online-btn" style="background-color: #0057b7 !important; color: #ffd700 !important; font-weight: bold; border-radius: 5px;">🇺🇦 UA Online</div>');

                    btn.on('hover:enter hover:click hover:touch', function () {
                        Lampa.Loading.start();

                        var movie = e.object.data || e.data;
                        var original = movie.original_title || movie.original_name || "";
                        var title_ua = movie.title || movie.name || "";

                        // Надсилаємо запит
                        var api = backend_url + '/api/search?q=' + encodeURIComponent(original) + '&ua_title=' + encodeURIComponent(title_ua);

                        var network = new Lampa.Reguest();
                        network.silent(api, function (results) {
                            Lampa.Loading.stop();
                            if (results && results.length > 0) {
                                Lampa.Select.show({
                                    title: 'Оберіть джерело (Українська озвучка)',
                                    items: results,
                                    onSelect: function (item) {
                                        Lampa.Player.run({
                                            url: item.url,
                                            title: title_ua
                                        });
                                    },
                                    onBack: function () {
                                        Lampa.Controller.toggle('full');
                                    }
                                });
                            } else {
                                Lampa.Noty.show('Української озвучки не знайдено на UAKino/Eneyida');
                            }
                        }, function () {
                            Lampa.Loading.stop();
                            Lampa.Noty.show('Сервер не відповідає');
                        });
                    });

                    container.append(btn);
                    Lampa.Controller.enable('full');
                }
            }
        });
    }

    if (window.appready) myUA_Plugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') myUA_Plugin();
    });
})();