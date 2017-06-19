(function (scope) {
    var _ = scope._;
    var PIXI = scope.PIXI;

    var Animation = function (obj, speed, images) {
        var frames = [ ];

        for (var i = 0; i < images.length; i++) {
            frames.push(scope.app.getTexture(images[i]));
        }

        //TODO: find a better place for sprite settings
        obj.hasSprite = true;
        obj.spriteConfig = obj.spriteConfig || { };

        if (!obj.spriteConfig.path) {
            obj.spriteConfig.path = images[0];
        }

        this.obj = obj;
        this.currentIndex = 0;
        this.frames = frames;
        this.speed = speed;
        this.isPlaying = false;
    };

    Animation.prototype.play = function () {
        this.currentIndex = 0;
        this.currentTime = 0;
        this.resume();
    };

    Animation.prototype.resume = function () {
        this.isPlaying = true;
    };

    Animation.prototype.stop = function () {
        this.currentIndex = 0;
        this.isPlaying = false;
        this.updateSprite();
    };

    Animation.prototype.update = function (time) {
        var upToDate = (time - this.currentTime) < this.speed;
        if (!this.isPlaying || upToDate) { return; }

        this.currentTime = time;

        this.updateSprite();

        this.currentIndex++;
        if (this.currentIndex === this.frames.length) {
            this.currentIndex = 0;
        }
    };

    Animation.prototype.updateSprite = function () {
        if (!this.obj.sprite) { return; }
        var t = this.frames[this.currentIndex];
        this.obj.sprite.texture = this.frames[this.currentIndex];
    };

    var AnimationCatalog = function (obj, animations) {
        var animationsByName = { };
        var current = null

        _.each(animations, function (anim, name) {
            var a = new Animation(obj, anim.speed, anim.images);
            animationsByName[name] = a;
            if (!current) { current = a }
        });

        this.current = current;
        this.animationsByName = animationsByName;
    };

    AnimationCatalog.prototype.play = function (name) {
        var newAnim = this.animationsByName[name];
        if (newAnim === this.current && this.current.isPlaying) { return; }

        if (this.current) { this.current.stop(); }
        this.current = this.animationsByName[name];
        this.current.play();
    };

    AnimationCatalog.prototype.resume = function () {
        this.current.resume();
    };

    AnimationCatalog.prototype.stop = function () {
        this.current.stop();
    };

    AnimationCatalog.prototype.update = function (time) {
        this.current.update(time);
    };

    AnimationCatalog.prototype.isPlaying = function () {
        return this.current.isPlaying;
    };

    scope.AnimationCatalog = AnimationCatalog;

})(window);
