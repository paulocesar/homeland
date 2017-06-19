(function (scope) {
    var _ = scope._;
    var utils = scope.utils;

    var types = { CIRCLE: 1, WALL: 2, PLANE: 3 };

    var collisionMethods = {
        // MUST rename the collision type to square.
        // we're forced to use square because of the order of objects
        // for isometric rendering. the square borders keep objects in
        // the correct position.
        circles: function (obj1, obj2, near) {
            var minDist = obj1.collision.radius + obj2.collision.radius,
                p1 = obj1.terrainPosition,
                p2 = obj2.terrainPosition;

            minDist += near;

            return Math.abs(p1.x - p2.x) < minDist &&
                Math.abs(p1.y - p2.y) < minDist;
        },

        // limited plane
        wallAndCircle: function (w, c, near) {
            var a = {
                x: w.terrainPosition.x + w.collision.offset2.x,
                y: w.terrainPosition.y + w.collision.offset2.y
            };
            var b = {
                x: w.terrainPosition.x + w.collision.offset1.x,
                y: w.terrainPosition.y + w.collision.offset1.y
            };
            var p = c.terrainPosition;
            var cp = utils.vector.closestLinePointToPoint(a, b, p);

            var distAB = utils.vector.distance(a, b);
            var distACP = utils.vector.distance(a, cp);
            var distBCP = utils.vector.distance(b, cp);


            var minDist = c.collision.radius + w.collision.size + near;

            if (distACP < distAB && distBCP < distAB) {
                return utils.vector.distance(cp, p) < minDist;
            }

            var n = distACP < distBCP ? a : b;
            return utils.vector.distance(n, p) < c.collision.radius + near;
        },

        walls: function (w1, w2) {
            return w1.terrainPosition.x === w2.terrainPosition.x &&
                w1.terrainPosition.y === w2.terrainPosition.y &&
                w1.isSide === w2.isSide;
        },

        // infine plane
        planeAndCircle: function (p, c, near) {

        }
    };

    _.each(collisionMethods, function (method, name) {
        collisionMethods[name] = _.bind(method, collisionMethods);
    });

    var cMap = { }
    _.each(types, function (t) { cMap[t] = { }; });

    function addCollisionMap(type1, type2, fn) {
        var t1 = types[type1],
            t2 = types[type2],
            f = collisionMethods[fn];
        cMap[t2][t1] = function (a, b, near) { return f(b, a, near) };
        cMap[t1][t2] = f;
    }

    addCollisionMap("CIRCLE", "CIRCLE", "circles");
    addCollisionMap("WALL", "CIRCLE", "wallAndCircle");
    addCollisionMap("PLANE", "CIRCLE", "planeAndCircle");
    addCollisionMap("WALL", "WALL", "walls");

    var collision = {
        types: types,
        collisionMap: cMap,

        check: function (a, b, near) {
            return cMap[a.collision.type][b.collision.type](a, b, near || 0);
        },

        checkAll: function (a, b) {
            var arr = [].concat(b);

            for(var i = 0; i < arr.length; i++) {
               if (this.check(a, arr[i])) {
                  return true;
               }
            }

            return false;
        }
    };

    scope.collision = collision;

})(window);
