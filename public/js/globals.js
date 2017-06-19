(function (scope) {
    var g = scope.globals = {
        SCREEN_WIDTH: 800,
        SCREEN_HEIGHT: 600,

        TILE_SIZE: 32,
        TILE_VISIBLE_QUANT: 34
    };

    g.SCREEN_OFFSET_X = (g.SCREEN_WIDTH / 2);
    g.SCREEN_OFFSET_Y = (g.SCREEN_HEIGHT / 2);
})(window);
