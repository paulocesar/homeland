(function (scope) {
    var _ = scope._;
    var globals = scope.globals;
    var utils = scope.utils;
    var resource = scope.resource;
    var tileSize = globals.TILE_SIZE,
        halfTileSize = Math.floor(tileSize / 2);

    var getMidPosition = function (pos) {
        var mPos = utils.map.getPosition(pos);
        return {
            x: (mPos.x * tileSize) + halfTileSize,
            y: (mPos.y * tileSize) + halfTileSize
        };
    };

    var getNearPositions = function (midPos, dist) {
        var borderPos = [ ];

        for (var i = 0 - dist; i <= dist; i += dist) {
            for (var j = 0 - dist; j <= dist; j += dist) {
                borderPos.push({ x: midPos.x + i, y: midPos.y + j });
            }
        }

        return borderPos;
    };

    var hasCollision = function (obj, pos, filter) {
        var futureObject = {
            terrainPosition: pos,
            collision: obj.collision,
            isSide: obj.isSide,
            isTop: obj.isTop,
            isTree: obj.isTree
        };

        filter = filter || function (o) {
            return o.objectId !== obj.objectId && o.hasCollision;
        };

        var map = scope.mapFactory.getObjectMap();
        var nearObjects = map.getNearObjects(futureObject, filter);
        return collision.checkAll(futureObject, nearObjects);
    };

    var findShortestPath = function (map, start, end) {
        var trail = [ ];
        var current = end;

        var getNext = function () {
            var weight = map[current.x][current.y];
            var list = getNearPositions(current, tileSize);
            var validPositions = [ ];
            _.each(list, function (p) {
                var isValid = map[p.x] &&
                        map[p.x][p.y] &&
                        map[p.x][p.y] >= weight - 1;

                if (isValid) {
                    validPositions.push(p);
                }
            });

            validPositions.sort(function (a, b) {
                return map[a.x][a.y] - map[b.x][b.y];
            });

            return validPositions[0];
        }

        var steps = 0;
        while (1) {
            if (steps === 10000) {
                console.log("cannot find shortest path");
                return [ start ];
            }
            steps++;

            trail.push(current);
            if (start.x === current.x && start.y === current.y) {
                return trail.reverse();
            };
            current = getNext();
        }
    };

    var findPath = function (obj, to) {
        var start = getMidPosition(obj),
            end = getMidPosition({ terrainPosition: to });

        if (start.x === end.x && start.y === end.y) {
            return [ start ];
        }

        var sort = function (a, b) {
            return utils.vector.distance(a, end)
                - utils.vector.distance(b, end);
        };

        var tempMap = { };
        tempMap[start.x] = { };
        tempMap[start.x][start.y] = 1;

        var getNextPosition = function (currentMid) {
            var positions = getNearPositions(currentMid, halfTileSize);
            positions.sort(sort);

            var weight = tempMap[currentMid.x][currentMid.y];
            var p = null;

            for (var i = 0; i < positions.length; i++) {
                p = positions[i];

                if (!tempMap[p.x]) {
                    tempMap[p.x] = { };
                    tempMap[p.x][p.y] = weight;
                    return p;
                }

                if (!tempMap[p.x][p.y]) {
                    tempMap[p.x][p.y] = weight;
                    return p;
                }
            }

            return null;
        };


        var getNextMid = function (currentMid, nextBorder) {
            var nextMid = {
                x: currentMid.x - Math.floor((currentMid.x - nextBorder.x) * 2),
                y: currentMid.y - Math.floor((currentMid.y - nextBorder.y) * 2)
            };

            var weight = tempMap[currentMid.x][currentMid.y] + 1;
            tempMap[nextMid.x] = tempMap[nextMid.x] || { };
            if (!tempMap[nextMid.x][nextMid.y]) {
                tempMap[nextMid.x][nextMid.y] = weight;
            }
            return nextMid;
        };

        var trail = [ ],
            current = start,
            weight = 1,
            nextBorder = null,
            map = scope.mapFactory.getObjectMap(),
            steps = 0;

        while (1) {
            if (steps === 10000) {
                console.log("cannot find path");
                return [ start ];
            }
            steps++;

            nextBorder = getNextPosition(current);

            if (!nextBorder) {
                current = trail.pop();
                if (!current && trail.length === 0) {
                    return [ start ];
                }
                continue;
            }

            if (hasCollision(obj, nextBorder)) {
                continue;
            }

            trail.push(current);
            current = getNextMid(current, nextBorder);

            if (current.x === end.x && current.y === end.y) {
                trail.push(current);
                break;
            }
        }

        return findShortestPath(tempMap, start, end);
    };

    utils.algorithms.hasCollision = hasCollision;
    utils.algorithms.findPath = findPath;

})(window);
