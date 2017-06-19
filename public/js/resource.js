(function (scope) {
    var _ = scope._;

    var label = {
        1: "Madeira",
        2: "Pedra",
        3: "Água",
        4: "Comida"
    };

    var resource = scope.resource = {
        dict: {
            wood: 1,
            stone: 2,
            water: 3,
            food: 4
        },

        create: function (name, quant) {
            var resourceId = _.isString(name) ? resource.dict[name] : name;
            if (resourceId === undefined) {
                throw new Error("Cannot create resource");
            }

            return { id: resourceId, quant: quant };
        },

        add: function (obtained, needed) {
            _.each(needed, function (n) {
                var r = _.find(obtained, { id: n.id });
                if (r) {
                    r.quant = r.quant + n.quant;
                    return;
                }

                var newR = resource.create(n.id, n.quant);
                obtained.push(newR);
                obtained.sort(function (r1, r2) {
                    return r1.id - r2.id;
                });
            })
        },

        has: function (obtained, needed) {
            var satisfied = true;
            _.each(needed, function (n) {
                var r = _.find(obtained, { id: n.id });
                if (!r || r.quant < n.quant) {
                    satisfied = false;
                }
            });

            return satisfied;
        },

        consume: function (obtained, needed) {
            if (!resource.has(obtained, needed)) {
                return false;
            }

            _.each(needed, function (n) {
                var r = _.find(obtained, { id: n.id });
                r.quant = r.quant - n.quant;
            });

            return true;
        },

        toString: function (resources) {
            var msg = "";
            _.each(resources, function (r) {
                msg += r.quant + " " + label[r.id] + "\n";
            });
            return msg;
        }
    };

})(window);
