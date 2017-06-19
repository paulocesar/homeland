(function (scope) {
    var $ = scope.$,
        globals = scope.globals,
        body = scope.document.body,
        renderer = null,
        displayGame = scope.displayGame,
        texturesByName = { };

    var app = {
        renderer: null,
        resources: [ ],

        getTexture: function (name) {
            var t = texturesByName[name];
            if (!t) {
                t = PIXI.Texture.fromFrame(name);
                texturesByName[name] = t;
            }
            return t;
        },

        createSprite: function (name) {
            return new PIXI.Sprite(app.getTexture(name));
        },

        addResource: function (rs) {
            this.resources = this.resources.concat(rs);
        },

        start: function () {
            displayGame.preload(this);

            PIXI.loader.add(this.resources).load(function () {
                app.onLoadDone();
            });
        },

        onLoadDone: function () {
            this.renderer = PIXI.autoDetectRenderer(
                globals.SCREEN_WIDTH,
                globals.SCREEN_HEIGHT
            );

            $('body').append(this.renderer.view);

            displayGame.start(this);

            var update = function () {
                requestAnimationFrame(update);
                app.update();
            };

            update();
        },

        update: function () {
            var time = (new Date()).getTime();
            displayGame.update(this, time);
        },

        render: function (container) {
            this.renderer.render(container);
        }
    };

    scope.app = app;
    $(document).ready(function () { app.start(); });

})(window);
