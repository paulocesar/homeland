(function (scope) {
    var _ = scope._;
    var utils = scope.utils;
    var eventManager = scope.eventManager;
    var resource = scope.resource;
    var collision = scope.collision;

    var craftObjectCatalog = {
        wallTop: {
            name: "Wall",
            isWall: true,
            isTop: true,

            spriteConfig: {
                craftPath: "/img/wall1-craft.png",
                path: "/img/wall1.png",
                offset: { x: 0, y: -32 }
            },

            collision: {
                type: collision.types.WALL,
                size: 3,
                offset1: { x: 0, y: 0 },
                offset2: { x: 32, y: 0 }
            },

            needsCraftWork: true,
            canCraft: true,
            canExtract: true,
            health: 200,
            resources: [
                resource.create('wood', 30)
            ]
        },

        wallSide: {
            name: "Wall",
            isWall: true,
            isSide: true,

            spriteConfig: {
                craftPath: "/img/wall2-craft.png",
                path: "/img/wall2.png",
                offset: { x: -32, y: -32 }
            },

            collision: {
                type: collision.types.WALL,
                size: 3,
                offset1: { x: 0, y: 0 },
                offset2: { x: 0, y: 32 }
            },

            needsCraftWork: true,
            canCraft: true,
            canExtract: true,
            health: 200,
            resources: [
                resource.create('wood', 30)
            ]
        },

        tree: {
            name: "Tree",
            isTree: true,

            spriteConfig: {
                path: "/img/tree1.png",
                offset: { x: -16, y: -60 }
            },

            collision: {
                type: collision.types.CIRCLE,
                radius: 6
            },

            needsCraftWork: false,
            canCraft: true,
            canExtract: true,
            health: 100,
            resources: [ resource.create('wood', 10) ],

            canTalk: true,
            talk: {
                1: function (self) {
                    if (!self.alreadyTalked) {
                        self.alreadyTalked = true;
                        return "Oi, eu sou uma árvore.";
                    }

                    return { text: "Olá de novo" };
                },

                2: function (self, obj) {
                    return {
                        text: "O que deseja fazer?",
                        options: {
                            Extrair: function () {
                                obj.extract(self);
                                return null;
                            },
                            "Nada. Obrigado": 3
                        }
                    };
                },

                3: "Tudo bem. Aquele abraço."
            }
        }
    };

    var CraftObject = utils.class.extend(GameObject, function (config) {
        GameObject.call(this, config);
        this.isCraftObject = true;
        this.craftHealth = this.health;
        this.action = new Action(this);
    });

    _.extend(CraftObject.prototype, {
        addSprite: function () {
            var isDone = this.craftHealth <= 0 || !this.needsCraftWork;
            if (this.sprite && isDone == this.isDone) { return; }

            this.removeSprite();

            var p = isDone ?
                this.spriteConfig.path :
                this.spriteConfig.craftPath;

            this.sprite = PIXI.Sprite.fromFrame(p);
            this.isDone = isDone;
            this.afterAddSprite();
        },

        onClick: function (ev) {
            eventManager.fire("click:object:craft", ev, this);
        }
    });


    scope.createCraftObject = function (x, y, type) {
        var cfg = { terrainPosition: { x: x, y: y } };
        _.extend(cfg, craftObjectCatalog[type]);
        return new CraftObject(cfg);
    };

})(window);
