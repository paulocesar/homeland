(function (scope) {
    var PIXI = scope.PIXI,
        _ = scope._,
        globals = scope.globals;

    var textConfig = {
        subtitle: {
            font: "13px verdana",
            fill: "#FFFFFF",
            align: "left",
            stroke: "#000000",
            strokeThickness: 2,
            x: 30,
            y: 10
        },

        extractPercent: {
            font: "15px verdana",
            fill: "#FFFFFF",
            align: "left",
            stroke: "#000000",
            strokeThickness: 2,
            x: (globals.SCREEN_WIDTH / 2) - 30,
            y: (globals.SCREEN_HEIGHT / 2) - 10
        },

        dialogue: {
            font: "13px verdana",
            fill: "#FFFFFF",
            align: "left",
            stroke: "#000000",
            strokeThickness: 2,
            x: 40,
            y: globals.SCREEN_HEIGHT - 90
        },

        resource: {
            font: "13px verdana",
            fill: "#FFFFFF",
            align: "left",
            stroke: "#000000",
            strokeThickness: 2,
            x: 30,
            y: 30
        }
    };

    function buildText(cfg) {
        var t = new PIXI.Text("", cfg);
        t.position.x = cfg.x;
        t.position.y = cfg.y;
        t.isHidden = true;
        return t;
    }

    var textByName = { };

    _.each(textConfig, function (c, name) {
        textByName[name] = buildText(c);
    });

    function bringToFront (t) {
        var p = t.parent;
        if (!p) { return; }
        p.removeChild(t);
        p.addChild(t);
    }

    scope.interface = {
        start: function (container) {
            this.container = container;
        },

        show: function (name, text) {
            var t = textByName[name];
            t.text = text;
            if (t.isHidden) {
                this.container.addChild(t);
                t.isHidden = false;
            }
        },

        hide: function (name) {
            var t = textByName[name];
            this.container.removeChild(t);
            t.isHidden = true;
        },

        update: function () {
            _.each(textByName, bringToFront);
        }
    };

})(window);
