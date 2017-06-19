(function (scope) {
    var _ = scope._;
    var GameObject = scope.GameObject;
    var collision = scope.collision;
    var Action = scope.Action;
    var interface = scope.interface;

    var animNameByOffset = {
        0: { '-1': 'up', 1: 'down' },
        1: { 1: 'downRight', 0: 'right', '-1': 'upRight' },
        '-1': { 1: 'downLeft', 0: 'left', '-1': 'upLeft' },
    }

    function buildAnimationCatalog (obj) {
        var animData = { };
        var names = [
            'up', 'down', 'left', 'right',
            'upRight', 'upLeft',
            'downRight', 'downLeft'
        ];

        _.each(names, function (name) {
            var n = name.toLowerCase();
            animData[name] = {
                images: [ n + 1, n + 2, n + 3, n + 4 ],
                speed: 100
            };
        });

        return animData;
    };

    var Player = utils.class.extend(GameObject, function (x, y) {
        var config = {
            terrainPosition: { x: x, y: y },
            spriteConfig: {
                offset: { x: -16, y: -32 }
            },

            collision: {
                type: collision.types.CIRCLE,
                radius: 6
            },

            animationCatalog: buildAnimationCatalog()
        };

        GameObject.call(this, config);

        this.health = 100;
        this.damage = 20;
        this.action = new Action(this);
    });

    Player.prototype.setDestiny = function (dest) {
        this.action.clear().do("walk", dest);
    };

    Player.prototype.extract = function (obj) {
        var anim = this.anim;
        var stopAnim = function () { anim.stop(); };
        this.action
            .clear()
            .do("walk", obj.terrainPosition)
            .do(stopAnim)
            .do("extract", obj);
    };

    Player.prototype.craft = function (obj) {
        var anim = this.anim;
        var stopAnim = function () { anim.stop(); };
        this.action
            .clear()
            .do("walk", obj.terrainPosition)
            .do(stopAnim)
            .do("craft", obj);
    };

    Player.prototype.talk = function (obj) {
        var player = this;

        this.action
            .clear()
            .do("walk", obj.terrainPosition)
            .do(function () {
                player.anim.stop();
                obj.action
                    .clear()
                    .addToGenericUpdate()
                    .do("talk", player);
            });
    }

    Player.prototype.update = function (time) {
        var res = this.action.update(time);

        this.anim.update(time);

        // maybe change to an event. we don't need to update always
        interface.show("extractPercent", "");

        if (this.action.isNoAction()) {
            if (this.anim.isPlaying()) { this.anim.stop() };
            if (this.isExtracting) {
                this.isExtracting = false;
                interface.hide("extractPercent");
            }
            return;
        }

        if (this.action.is("extract") || this.action.is("craft")) {
            this.isExtracting = true;

            var points = Math.floor(res.hitPercent / 10);
            points = (points + 1) % 10;
            var text = '';
            while(points--) { text += '.'; }
            interface.show("extractPercent", text);
        }

        if (this.action.is("walk")) {
            var offset = res.offset || { x: 0, y: 0 };
            var animName = animNameByOffset[offset.x][offset.y];
            if (animName) {
                this.anim.play(animName);
            }
        }
    };

    scope.Player = Player;

})(window);
