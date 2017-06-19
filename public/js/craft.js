(function (scope) {
    var PIXI = scope.PIXI;
    var _ = scope._;
    var utils = scope.utils;
    var collision = scope.collision;
    var mapFactory = scope.mapFactory;
    var createCraftObject = scope.createCraftObject;
    var resource = scope.resource;
    var hasCollision = utils.algorithms.hasCollision;

    var create = createCraftObject;
    var craftByName = {
        wall: {
            top: function (x, y) { return create(x, y, 'wallTop'); },
            bottom: function (x, y) { return create(x, y, 'wallTop'); },
            left: function (x, y) { return create(x, y, 'wallSide'); },
            right: function (x, y) { return create(x, y, 'wallSide'); }
        },

        tree: function (x, y) { return create(x, y, 'tree'); }
    };

    var crafter = { };
    var craftTemplate = { };

    _.each(craftByName, function (craft, name) {
        var cft = crafter[name] = { };
        var tpl = craftTemplate[name] = { };

        function buildTpl () {
            _.each(cft, function (fn, position) {
                var obj = fn(0, 0);
                obj.hasCollision = false;
                tpl[position] = obj;
            });
        }

        if (_.isFunction(craft)) {
            cft.top = craft;
            buildTpl();
            return;
        }
        _.each(craft, function (fn, position) {
            cft[position] = fn;
            if (!cft.top) { cft.top = fn; }
        });
        buildTpl();

    });

    var mapMouseRegion = [
        [ "left", "left", "bottom", "bottom" ],
        [ "top", "mid", "bottom", "bottom" ],
        [ "right", "right", "bottom", "bottom" ],
        [ "right", "right", "bottom", "bottom" ]
    ];

    scope.craft = {
        mode: "wall",
        region: "top",

        start: function (resourceProvider) {
            this.current = this.getTemplate();
            this.provider = resourceProvider;
        },

        getTemplate: function () {
            var tpl = craftTemplate[this.mode];
            return tpl[this.region] || tpl.top;
        },

        setBuilder: function (builderType) {
            this.type = builderType;
        },

        updatePosition: function (pos) {
            var areaSize =  Math.floor(globals.TILE_SIZE / 3);

            var offset = {
                x: Math.floor(pos.x % globals.TILE_SIZE),
                y: Math.floor(pos.y % globals.TILE_SIZE)
            };

            var mr = {
                x: Math.floor(Math.abs(offset.x / areaSize)),
                y: Math.floor(Math.abs(offset.y / areaSize))
            };

            this.region = mapMouseRegion[mr.x][mr.y];
            var obj = this.getTemplate();
            var m = mapFactory.getObjectMap();

            if (this.current !== obj) {
                m.remove(this.current);
                this.current = obj;
                m.add(this.current);
            }


            var newPos = {
                x: pos.x - offset.x,
                y: pos.y - offset.y
            };

            if (this.region === "right") { newPos.x += globals.TILE_SIZE; }
            if (this.region === "bottom") { newPos.y += globals.TILE_SIZE; }

            m.move(this.current, newPos);
        },

        changeObject: function () {
            this.mode = (this.mode === "wall") ? "tree" : "wall";
        },

        setObject: function () {
            var current = this.current;
            var currentPos = current.terrainPosition;
            var c = crafter[this.mode];
            var build = c[this.region] || c.top;
            var obj = build(currentPos.x, currentPos.y);
            var filter = function (o) {
                return o.hasCollision && (!o.isCraftObject || (
                    o.terrainPosition.x === currentPos.x &&
                    o.terrainPosition.y === currentPos.y
                ));
            };

            if (!resource.has(this.provider.resources, current.resources)) {
                return false;
            }

            if (hasCollision(current, currentPos, filter)) {
                return false;
            }

            resource.consume(this.provider.resources, current.resources);
            mapFactory.getObjectMap().add(obj);
            return true;
        }
    };

})(window);
