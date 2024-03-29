(function(scope) {

    function EventManager() {
        this._listeners = {};
    }

    EventManager.prototype = {
        addListener : function(name, fn) {
            (this._listeners[name] = this._listeners[name] || []).push(fn);
            return this;
        },
        removeListener : function(name, fn) {
            if(arguments.length === 1) { // remove all
                this._listeners[name] = [];
            }
            else if(typeof(fn) === 'function') {
                var listeners = this._listeners[name];
                if(listeners !== undefined) {
                    var foundAt = -1;
                    for(var i = 0, len = listeners.length; i < len && foundAt === -1; i++) {
                        if(listeners[i] === fn) {
                            foundAt = i;
                        }
                    }

                    if(foundAt >= 0) {
                        listeners.splice(foundAt, 1);
                    }
                }
            }

            return this;
        },
        fire : function(name) {
            var listeners = this._listeners[name];
            var args = Array.prototype.slice.call(arguments);
            args.shift();
            if(listeners !== undefined) {
                var data = {}, evt;
                for(var i = 0, len = listeners.length; i < len; i++) {
                    evt = new EventManager.EventArg(name, data);

                    listeners[i].apply(window, [ evt ].concat(args));

                    data = evt.data;
                    if(evt.removed) {
                        listeners.splice(i, 1);
                        len = listeners.length;
                        --i;
                    }
                    if(evt.cancelled) {
                        break;
                    }
                }
            }
            return this;
        },
        hasListeners : function(name) {
            return (this._listeners[name] === undefined ? 0 : this._listeners[name].length) > 0;
        }
    };
    EventManager.eventify = function(object, manager) {
        var methods = EventManager.eventify.methods;
        manager = manager || new EventManager();

        for(var i = 0, len = methods.length; i < len; i++) (function(method) {
            object[method] = function() {
                return manager[method].apply(manager, arguments);
            };
        })(methods[i]);

        return manager;
    };
    EventManager.eventify.methods = ['addListener', 'removeListener', 'fire'];

    EventManager.EventArg = function(name, data) {
        this.name = name;
        this.data = data;
        this.cancelled = false;
        this.removed = false;
    };
    EventManager.EventArg.prototype = {
        cancel : function() {
            this.cancelled = true;
        },
        remove : function() {
            this.removed = true;
        }
    };

    var eventManager = scope.eventManager = new EventManager();
})(window);
