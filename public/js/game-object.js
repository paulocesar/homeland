(function (scope) {
    var PIXI = scope.PIXI,
        nextObjectId = 0,
        AnimationCatalog = scope.AnimationCatalog;

    /*
     * var o = new GameObject({
     *  terrainPosition: { x: 0, y: 0 },
     *
     *  spriteConfig: {
     *      path: "/img/example.png",
     *      offset: { x: 0, y : 0 }
     *  },
     *  onClick: function (ev) {
     *      eventManager.fire("click:object", ev, this);
     *  },
     *
     *  //plugins
     *  collision: {
     *      type: collision.types.CIRCLE,
     *      radius: 3
     *  },
     *  animationCatalog: {
     *      down: [ "down1", "down2" ],
     *      up: [ "up1", "up2" ]
     *  }
     * });
     */

    function GameObject (config) {
        _.extend(this, config);

        this.objectId = ++nextObjectId;

        if (!this.terrainPosition) {
            this.terrainPosition = { x: 0, y: 0 };
        }

        this.update = this.update || function () { };

        if (this.animationCatalog) {
            this.hasAnimation = true;
            this.anim = new AnimationCatalog(this, this.animationCatalog);
        }

        if (this.spriteConfig) {
            this.hasSprite = true;
        }

        if (this.collision) {
            this.hasCollision = true;
        }
    }

    GameObject.prototype.addSprite = function () {
        if (this.sprite) { return; }
        this.sprite = scope.app.createSprite(this.spriteConfig.path);
        this.afterAddSprite();
    };

    GameObject.prototype.removeSprite = function () {
        delete this.sprite;
    };

    GameObject.prototype.afterAddSprite = function () {
        if (!this.onClick) { return; }

        var o = this;
        var s = this.sprite;
        s.interactive = true;
        s.mousedown = s.touchstart = function (ev) {
            o.onClick(ev);
        };
    };

    scope.GameObject = GameObject;
})(window);
