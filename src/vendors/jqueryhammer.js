/*
 * SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
 *
 * SPDX-License-Identifier: CC0-1.0
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jQuery', 'Hammer'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jQuery'), require('Hammer'));
    } else {
        factory(jQuery, Hammer);
    }
}(function($, Hammer) {
    function hammerify(el, options) {
        var $el = $(el);
        if(!$el.data("hammer")) {
            $el.data("hammer", new Hammer($el[0], options));
        }
    }

    $.fn.hammer = function(options) {
        return this.each(function() {
            hammerify(this, options);
        });
    };

    // extend the emit method to also trigger jQuery events
    Hammer.Manager.prototype.emit = (function(originalEmit) {
        return function(type, data) {
            originalEmit.call(this, type, data);
            $(this.element).trigger({
                type: type,
                gesture: data
            });
        };
    })(Hammer.Manager.prototype.emit);
}));
