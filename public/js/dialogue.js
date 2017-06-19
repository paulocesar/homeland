(function (scope) {
    var _ = scope._;

    /*
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
    */

    var dialogue = scope.dialogue = {
        isRunning: false,
        currentStatus: 0,

        updateBox: function (talk) {
            if (!talk) {
                dialogue.isRunning = false;
                return scope.interface.hide("dialogue");
            }

            dialogue.isRunning = true;
            scope.interface.show("dialogue", talk.text);
        },

        update: function (obj, obj2, status) {

            if (!status) {
                status = 1;
            }

            if (status != dialogue.currentStatus) {
                dialogue.currentStatus = status;
                var t = obj.talk[dialogue.currentStatus];
                t = _.isFunction(t) ? t(obj, obj2) : t;
                t = _.isString(t) ? { text: t } : t;
                dialogue.updateBox(t);
            }

            return status;
        },

        onClick: function () {
            this.currentStatus++;
        }
    };
})(window);
