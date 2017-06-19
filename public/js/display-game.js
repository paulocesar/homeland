(function (scope) {
    var PIXI = scope.PIXI,
        globals = scope.globals,
        worldRenderer = scope.worldRenderer,
        craft = scope.craft,
        utils = scope.utils,
        interface = scope.interface,
        controls = scope.controls;

    var origPos = { x: 2500, y: 2500 },
        destPos = { x: 2500, y: 2500 };


    var gameMode = {
        current: {},

        modesByKey: {
            a: {
                name: "walk",
                subtitle: function () { return "Andar"; },
            },
            e: {
                name: "extract",
                subtitle: function () { return "Extrair"; },
            },
            s: {
                name: "edit",
                subtitle: function (objName) { return "Editar: " + objName; }
            }
        },

        is: function (name) {
            return this.current && this.current.name === name;
        },

        setMode: function (key, text) {
            var m = this.modesByKey[key];
            this.current = m;
            interface.show("subtitle", m.subtitle(text));
            return m.name;
        }
    }

    scope.displayGame = {
        name: "game",

        preload: function (app) {
            app.addResource('/img/char.json');
            app.addResource('/img/terrain.json');
            app.addResource('/img/tree1.png');
            app.addResource('/img/wall1.png');
            app.addResource('/img/wall1-craft.png');
            app.addResource('/img/wall2.png');
            app.addResource('/img/wall2-craft.png');
            app.addResource('/img/floor1.png');
            app.addResource('/img/floor2.png');
            app.addResource('/img/floor3.png');
        },

        start: function (app) {
            this.container = new PIXI.Container();

            // interface
            interface.start(this.container);

            // controls
            controls.start();

            gameMode.setMode("a");
            controls.onKeyPress(function (key) {
                if (["a", "e", "s"].indexOf(key) === -1) { return; }

                if (key === "s") {
                    if (gameMode.is("edit")) { craft.changeObject(); }
                    gameMode.setMode(key, craft.mode);
                    return;
                }

                gameMode.setMode(key);
            });

            //create maps
            mapFactory.start({ x: 100, y: 100 });

            // create player
            var player = this.player = new Player(1616, 1552);
            mapFactory.getObjectMap().add(this.player);

            //connect craft tool
            craft.start(player);

            eventManager.addListener("click:object:craft", function (ev, objEv, obj) {
                objEv.stopPropagation();

                if (scope.dialogue.isRunning) {
                    scope.dialogue.onClick();
                    return;
                }

                if (gameMode.is("extract")) {
                    player.extract(obj);
                    return;
                }

                if (gameMode.is("walk")) {
                    if (!obj.isDone) {
                        player.craft(obj);
                        return;
                    }

                    if (obj.canTalk) {
                        player.talk(obj);
                        return;
                    }
                }
            });

            // create world
            var onMouseDown = controls.mouseEvent(function (ev, offset) {
                if (scope.dialogue.isRunning) {
                    scope.dialogue.onClick();
                    return;
                }

                var dest = {
                    x: origPos.x + offset.x,
                    y: origPos.y + offset.y
                };

                if (!gameMode.is("edit")) {
                    destPos = dest;
                    player.setDestiny(destPos);
                }

                if (gameMode.is("edit")) {
                    craft.setObject(dest);
                }
            });

            var onMouseMove = controls.mouseEvent(function (ev, offset) {
                var mousePos = {
                    x: origPos.x + offset.x,
                    y: origPos.y + offset.y
                };

                // think in a better soluttion
                if (!gameMode.is("edit")) {
                    mousePos.x = 100000;
                }

                craft.updatePosition(mousePos);
            });

            worldRenderer.init(origPos, mapFactory.getAllMaps());
            worldRenderer.move(this.player.terrainPosition);
            worldRenderer.container.mousedown = onMouseDown;
            worldRenderer.container.touchstart = onMouseDown;
            worldRenderer.container.mousemove = onMouseMove;
            this.container.addChild(worldRenderer.container);
            worldRenderer.show();
        },

        update: function (app, time) {
            scope.Action.genericUpdate(time);
            this.player.update(time);
            worldRenderer.move(this.player.terrainPosition);

            interface.show(
                "resource",
                scope.resource.toString(this.player.resources)
            );
            interface.update();

            app.render(this.container);
        }
    };

})(window);
