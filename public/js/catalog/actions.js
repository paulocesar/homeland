(function (scope) {
    var _ = scope._;
    var globals = scope.globals;
    var utils = scope.utils;
    var resource = scope.resource;
    var findPath = utils.algorithms.findPath;
    var hasCollision = utils.algorithms.hasCollision;

    var actionCatalog = {
        clear: function () {
            this.directions = null;
            this.to = null;
            this.lastTime = 0;
            this.talkStatus = null;
        },

        walk: function (obj, to, speed) {
            var offset = { x: 0, y: 0 };
            var noAction = { action: null, offset: { x: 0, y: 0 } };
            var from = obj.terrainPosition;

            if (from.x === to.x && from.y === to.y) {
                this.directions = null;
                return noAction;
            }

            if (!this.directions) {
                this.directions = findPath(obj, to);
                this.to = this.directions.shift();
            }

            if (from.x === this.to.x && from.y === this.to.y) {
                if (this.directions.length === 0) {
                    this.directions = null;
                    return noAction;
                }
                this.to = this.directions.shift();
            }

            speed = speed || 1;

            var distX = Math.abs(from.x - this.to.x),
                distY = Math.abs(from.y - this.to.y),
                moveInX = distX > distY || distX === distY,
                moveInY = distX < distY || distX === distY;

            if (from.x < this.to.x && moveInX) { offset.x += speed; }
            if (from.x > this.to.x && moveInX) { offset.x -= speed; }
            if (from.y < this.to.y && moveInY) { offset.y += speed; }
            if (from.y > this.to.y && moveInY) { offset.y -= speed; }

            var futurePos = { x: from.x + offset.x, y: from.y + offset.y };
            if (hasCollision(obj, futurePos)) {
                this.directions = null;
                return noAction;
            }

            var map = scope.mapFactory.getObjectMap();
            map.remove(obj);
            from.x += offset.x;
            from.y += offset.y;
            map.add(obj);

            return { action: "walk", offset: offset };
        },

        extract: function (obj, obj2) {
            var noAction = { action: null };
            var near = 24;
            if (!obj2.health || obj2.health <= 0) { return noAction; }
            if (!collision.check(obj, obj2, near)) { return noAction; }

            // percent = ((this.time - lastTime) * 100) / 1000;
            var hitPercent = Math.min(
                Math.floor((this.time - this.lastTime) / 10),
                100
            );

            var act = {
                action: "extract",
                hitPercent: hitPercent
            };

            if (this.time - this.lastTime < 1000) { return act; }
            this.lastTime = this.time;

            var dmg = obj.damage || 1;

            obj2.health = obj2.health - dmg;

            if (obj2.health > 0) { return act; }

            var r = obj.resources || [ ];
            resource.add(r, obj2.resources);
            obj.resources = r;

            obj2.removeSprite();
            mapFactory.getObjectMap().remove(obj2);

            return noAction;
        },

        craft: function (obj, obj2) {
            var noAction = { action: null };
            var near = 24;
            if (!obj2.craftHealth || obj2.craftHealth <= 0) { return noAction; }
            if (!collision.check(obj, obj2, near)) { return noAction; }

            // percent = ((this.time - lastTime) * 100) / 1000;
            var hitPercent = Math.min(
                Math.floor((this.time - this.lastTime) / 10),
                100
            );

            var act = {
                action: "craft",
                hitPercent: hitPercent
            };

            if (this.time - this.lastTime < 1000) { return act; }
            this.lastTime = this.time;

            var dmg = obj.damage || 1;

            obj2.craftHealth = obj2.craftHealth - dmg;

            if (obj2.craftHealth > 0) { return act; }

            return noAction;
        },

        findPath: function (obj, destiny) {

        },

        follow: function (obj, obj2) {
            return { action: "follow" };
        },

        talk: function (obj, obj2) {
            this.talkStatus = scope.dialogue.update(obj, obj2, this.talkStatus);
            if (this.talkStatus) {
                return { action: "talk", status: this.talkStatus };
            }

            return { action: null };
        }
    };

    scope.actionCatalog = actionCatalog;
})(window);
