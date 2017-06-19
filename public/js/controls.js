(function (scope) {
    var globals = scope.globals,
        utils = scope.utils;

    scope.controls = {
        start: function () {
            var self = this;
            this._onKeyPress = function () { };

            document.addEventListener("keypress", function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                self._onKeyPress(ev.key);
            });
        },

        onKeyPress: function (fn) {
            this._onKeyPress = fn;
        },

        mouseEvent: function (cb) {
            var mouseOffset = this.getMouseOffset;

            return function (ev) {
                var offset = mouseOffset(ev);
                return cb(ev, offset);
            };
        },

        getMouseOffset: function (ev) {
            var clickOffsetX = ev.data.global.x - (globals.SCREEN_WIDTH / 2),
                clickOffsetY = ev.data.global.y - (globals.SCREEN_HEIGHT / 2),
                offset = utils.vector.isoToTwoD(clickOffsetX, clickOffsetY);

            return offset;
        }
    }
})(window);
