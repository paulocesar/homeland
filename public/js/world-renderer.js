(function (scope) {
    var utils = scope.utils,
        globals = scope.globals;

    scope.worldRenderer = {
        position: { x: 0, y: 0 },
        visibleObjects: [ ],

        init: function (initialPosition, layers) {
            this.position = initialPosition;
            this.layers = layers;
            this.updateVisibleBoundaries();

            this.container = new PIXI.Container();
            this.container.interactive = true;
            this.container.hitArea = new PIXI.Rectangle(
                0, 0,
                globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT
            );
        },

        move: function (position) {
            this.position.x = position.x;
            this.position.y = position.y;
            this.refresh();
        },

        offset: function (offset) {
            this.position.x += offset.x;
            this.position.y += offset.y;
            this.refresh();
        },

        show: function () { this.refresh(); },

        hasObjectsInLayerPosition: function (layer, x, y) {
            return !!layer[x] && !!layer[x][y];
        },

        refresh: function () {
            this.updateVisibleBoundaries();

            this.deleteHiddenSprites();
            this.container.removeChildren();

            var boundaries = this.mapVisibleBoundaries;

            var layer = null;
            for (var l = 0; l < this.layers.length; l++) {
                layer = this.layers[l];
                for (var x = boundaries.minX; x < boundaries.maxX; x++) {
                    for (var y = boundaries.minY; y < boundaries.maxY; y++) {
                        this.setObjectPosition(layer, x, y);
                    }
                }
            }
        },

        //FIX: not removing all objects
        deleteHiddenSprites: function () {
            var boundaries = this.mapVisibleBoundaries,
                mapPos = null,
                isOutOfBound  = false,
                obj = null;

            for (var i = 0; i < this.visibleObjects.length; i++) {
                obj = this.visibleObjects[i];
                mapPos = utils.map.getPosition(obj);
                isOutOfBound = mapPos.x < boundaries.minX ||
                    mapPos.x > boundaries.maxX ||
                    mapPos.y < boundaries.minY ||
                    mapPos.y > boundaries.maxY;

                if (isOutOfBound) {
                    obj.removeSprite();
                }
            }

            this.visibleObjects = [ ];
        },

        setObjectPosition: function (layer, x, y) {
            if (!this.hasObjectsInLayerPosition(layer, x, y)) { return; }

            var item = null;
            var objects = layer[x][y];
            var o = null;
            var i = 0;

            for (i = 0; i < objects.length; i++) {
                o = objects[i];
                o.addSprite();
                this.setSpritePosition(o, x, y);
            }

            objects.sort(function (a, b) {
                var diffX = a.x - b.x;
                var diffY = a.y - b.y;
                return diffX || diffY;
            });

            for (i = 0; i < objects.length; i++) {
                o = objects[i];
                this.container.addChild(o.sprite);
                this.visibleObjects.push(o);
            }
        },

        // IMPORTANT: the tile position is computed
        // using terrain.position (where we wan't to set the
        // center of the map) + objPosition +
        // obj.spriteConfig.offset + screenOffset (center of the screen)
        setSpritePosition: function (obj, x, y) {
            var relativePos = null,
                isoRelativePos = null;

            // set object position relative to the center
            relativePos = {
                x: obj.terrainPosition.x - this.position.x,
                y: obj.terrainPosition.y - this.position.y
            };

            //transform to isometric position
            isoRelativePos = utils.vector.pointToIso(relativePos);

            // apply offset related to terrain relief
            var offset = obj.spriteConfig.offset || { x: 0, y: 0 };
            isoRelativePos.x += offset.x;
            isoRelativePos.y += offset.y;

            // set object to screen center
            isoRelativePos.x += globals.SCREEN_OFFSET_X;
            isoRelativePos.y += globals.SCREEN_OFFSET_Y;

            // apply position to object sprite
            obj.sprite.position.x = isoRelativePos.x;
            obj.sprite.position.y = isoRelativePos.y;
        },

        updateVisibleBoundaries: function () {
            var halfQuant = globals.TILE_VISIBLE_QUANT / 2;
            var tileSize = globals.TILE_SIZE;
            var pos = this.position;

            this.mapVisibleBoundaries = {
                minX: Math.floor(pos.x / tileSize) - halfQuant,
                maxX: Math.floor(pos.x / tileSize) + halfQuant,
                minY: Math.floor(pos.y / tileSize) - halfQuant,
                maxY: Math.floor(pos.y / tileSize) + halfQuant
            };

            return this.mapVisibleBoundaries;
        }
    };

}(window));
