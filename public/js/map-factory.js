(function (scope) {
    var globals = scope.globals,
        GameObject = scope.GameObject,
        utils = scope.utils,
        createCraftObject = scope.createCraftObject,
        _ = scope._;

    var tileDepthByType = { },
        tileTypesById = { },
        tileTypes = [
            '/img/floor1.png', '/img/floor2.png',
            '/img/floor3.png'
        ];

    var buildTileData = function () {
        var tName = null;

        for (var i = 0; i < tileTypes.length; i++) {
            tName = tileTypes[i];
            tileTypesById[tName.toUpperCase()] = i;
            tileDepthByType[tName] = 0;
        }
    };

    buildTileData();

    var tileFactory = {
        create: function (x, y, terrainTypeId) {
            var tileSize = globals.TILE_SIZE;
            var terrainType = tileTypes[terrainTypeId];

            var tile = new GameObject({
                terrainPosition: {
                    x: x * tileSize,
                    y: y * tileSize,
                },
                spriteConfig: {
                    path: terrainType,
                    offset: {
                        x: 0 - tileSize,
                        y: tileDepthByType[terrainType] - tileSize
                    }
                }
            });

            return tile;
        },

        randomCreate: function (x, y) {
            var terrainTypeId = Math.floor(Math.random() * tileTypes.length);
            return this.create(x, y, terrainTypeId);
        }
    };


    function Map () { };

    Map.prototype.isInMap = function (pos) {
        var map = this;
        return !!(map[pos.x] && map[pos.x][pos.y]);
    };

    Map.prototype.add = function (obj) {
        var p = utils.map.getPosition(obj);
        var map = this;
        if (!this.isInMap(p)) {
            map[p.x] = map[p.x] || { };
            map[p.x][p.y] = [ ];
        }
        this.remove(obj);

        var m = map[p.x][p.y];
        m.push(obj);
        map[p.x][p.y] = m;
    };

    Map.prototype.remove = function (obj) {
        var orig = utils.map.getPosition(obj);
        var map = this;
        if (!this.isInMap(orig)) { return; }

        var arr = map[orig.x][orig.y];
        map[orig.x][orig.y] = _.filter(arr, function (o) {
            return o.objectId !== obj.objectId;
        });
    };

    Map.prototype.move = function (obj, pos) {
        this.remove(obj);
        obj.terrainPosition.x = pos.x;
        obj.terrainPosition.y = pos.y;
        this.add(obj);
    };

    Map.prototype.getNearObjects = function (obj, filter) {
        var orig = utils.map.getPosition(obj);
        var pos = { x: 0, y: 0 };
        var nearObjects = [ ];

        for(pos.x = orig.x - 1; pos.x <= orig.x + 1; pos.x++) {
            for(pos.y = orig.y - 1; pos.y <= orig.y + 1; pos.y++) {
                if (!this.isInMap(pos)) {
                    continue;
                }

                nearObjects = nearObjects.concat(
                    _.filter(this[pos.x][pos.y], filter)
                );
            }
        }

        return nearObjects;
    };

    scope.Map = Map;

    scope.mapFactory = {
        start: function (mapSize) {
            this.ground = this.createRandomTileMap(mapSize);
            this.map = this.createRandomForrestMap(mapSize);
        },

        getObjectMap: function () {
            return this.map;
        },

        getAllMaps: function () {
            return [ this.ground, this.map ];
        },

        createRandomTileMap: function (size) {
            var map = new Map();
            for (var x = 0; x < size.x; x++) {
                map[x] = { };

                for(var y = 0; y < size.y; y++) {
                    map[x][y] = [ tileFactory.randomCreate(x, y) ];
                }
            }

            return map;
        },

        createRandomForrestMap: function (size) {
            var MAX = Math.floor((size.x * size.y) / 5);
            var quant = MAX;
            var tries = 0;
            var map = new Map();
            var t = null;
            var countTrees = 0;

            var collide = function (o) {
                return o.hasCollision && collision.check(t, o);
            };

            while (quant--) {
                if (tries == 10) break;
                var pos = utils.vector.random(size);
                map[pos.x] = map[pos.x] || { };

                var t = createCraftObject(
                    pos.x * globals.TILE_SIZE,
                    pos.y * globals.TILE_SIZE,
                    "tree"
                );

                if(t && map.getNearObjects(t, collide).length > 0) {
                    tries++;
                    continue;
                }

                tries = 0;

                map[pos.x][pos.y] = [ t ];
                countTrees++;
            }

            return map;
        }
    };

})(window);
