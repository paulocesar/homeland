(function (scope) {
    var globals = scope.globals;

    var vectorUtils = {
        twoDtoIso: function (x, y) {
            return {
                x: Math.floor(x - y),
                y: Math.floor((x + y) / 2)
            };
        },

        isoToTwoD: function (x, y) {
            return {
                x: Math.floor(((2 * y) + x) / 2),
                y: Math.floor(((2 * y) - x) / 2)
            };
        },

        pointToIso: function (p) {
            return this.twoDtoIso(p.x, p.y);
        },

        applyIso: function (p) {
            var newP = this.pointToIso(p);
            p.x = newP.x;
            p.y = newP.y;
            return p;
        },

        random: function (size) {
            return {
                x: Math.floor(Math.random() * size.x),
                y: Math.floor(Math.random() * size.y)
            }
        },

        distance: function (a, b) {
           return Math.floor(Math.sqrt(
               Math.pow((a.x-b.x), 2) +
               Math.pow((a.y-b.y), 2)
           ));
        },

        // http://stackoverflow.com/questions/3120357/get-closest-point-to-a-line?answertab=votes#tab-top
        // http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
        closestLinePointToPoint: function (a, b, p) {
            var aToP = { x: p.x - a.x, y: p.y - a.y };
            var aToB = { x: b.x - a.x, y: b.y - a.y };
            var aToB2 = Math.pow(aToB.x, 2) + Math.pow(aToB.y, 2);
            var aToPDotAToB = aToP.x*aToB.x + aToP.y*aToB.y;
            var dist = aToPDotAToB / aToB2;

            return {
                x: Math.floor(a.x + aToB.x*dist),
                y: Math.floor(a.y + aToB.y*dist)
            };
        }
    };


    var classUtils = {
        extend: function (SuperClass, constructor) {
            if (!constructor) {
                constructor = function () {
                    SuperClass.call(this);
                };
            }

            function NewClass() {
                constructor.apply(this, arguments);
            }

            function c() {
                this.constructor = SuperClass.constructor;
            }

            c.prototype = SuperClass.prototype;

            for (var prop in SuperClass) {
                if (Object.hasOwnProperty.call(SuperClass, prop)) {
                    NewClass[prop] = SuperClass[prop];
                }
            }

            NewClass.prototype = new c();

            return NewClass;
        }
    };

    var mapUtils = {
        getPosition: function (obj) {
            var tileSize = globals.TILE_SIZE;
            return {
                x: Math.floor(obj.terrainPosition.x / tileSize),
                y: Math.floor(obj.terrainPosition.y / tileSize)
            };
        }
    };

    var debugUtils = {
        start: function (container) {
            this.container = container;
            this.items = this.items || [];
            this.clear();
        },

        clear: function () {
            for (var i = 0; i < this.items.length; i++) {
                this.container.removeChild(this.items[i]);
            }
            this.items = [];
        },

        drawCircle: function (obj) {
            var pos = {
                x: obj.sprite.x - obj.spriteOffset.x,
                y: obj.sprite.y - obj.spriteOffset.y
            }
            var c = new PIXI.Graphics();
            c.lineStyle(2, 0xFF00FF);
            c.drawCircle(pos.x, pos.y, 2);
            c.endFill();
            this.items.push(c);
            this.container.addChild(c);
        }
    };

    scope.utils = {
        class: classUtils,
        debug: debugUtils,
        map: mapUtils,
        vector: vectorUtils,
        algorithms: { }
    };

})(window);
