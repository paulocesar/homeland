(function (scope) {
    var _ = scope._;

    function Action (obj) {
        this.obj = obj;
        this.action = null;
    };

    scope.Action = Action;

    Action.running = [ ];

    Action.genericUpdate = function (time) {
        var i = null;
        var a = null;
        Action.running = _.filter(Action.running, function (a) {
            return !a.isNoAction();
        });

        for (i = 0; i < Action.running.length; i++) {
            a = Action.running[i];
            a.update(time);
        }
    };

    _.extend(Action.prototype, {
        actionQueue: [ ],
        getAction: function () { return this.actionQueue[0]; },
        getActionName: function () {
            var a = this.getAction();
            return a && a.name;
        },

        is: function (act) { return this.getActionName() === act; },
        isNoAction: function () { return !this.getActionName(); },

        clear: function () {
            this.actionQueue = [ ];
            scope.actionCatalog.clear.apply(this);
            return this;
        },

        addToGenericUpdate: function () {
            if (Action.running.indexOf(this) === -1) {
                Action.running.push(this);
            }
            return this;
        },

        do: function (act) {
            if (_.isFunction(act)) {
                this.actionQueue.push(act);
                return this;
            }

            this.lastTime = 0;

            var args = Array.prototype.slice.call(arguments);
            args.shift();

            this.actionQueue.push({ name: act, args: args });
            return this;
        },

        update:  function (time) {
            var a = this.getAction();
            this.time = time;
            if (!a) { return { }; }

            if (_.isFunction(a)) {
                a();
                this.actionQueue.shift();
                return {};
            };

            // get from gameObject.actions
            var fn = scope.actionCatalog[a.name];
            var newAct = fn.apply(this, [ this.obj ].concat(a.args));

            if (!newAct.action) { this.actionQueue.shift(); }

            return newAct;
        }
    });
})(window);
