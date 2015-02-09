/*global define, console, window, document, history, tizen*/

/**
 * Init page module
 */

define({
    name: 'views/init',
    requires: [
        'core/event',
        'core/application',
        'core/systeminfo',
        'views/main',
        'views/options',
    ],
    def: function viewsInit(req) {
        'use strict';

        var e = req.core.event,
            app = req.core.application,
            sysInfo = req.core.systeminfo;

        /**
         * Handles tizenhwkey event.
         * @param {event} ev
         */
        function onHardwareKeysTap(ev) {
            var keyName = ev.keyName,
                page = document.getElementsByClassName('ui-page-active')[0],
                pageId = page ? page.id : '';

            if (keyName === 'back') {
                if (pageId === 'main') {
                    app.exit();
                } else {
                    history.back();
                }
            }
        }

        /**
         * Handles visibilitychange event.
         */
        function onVisibilityChange() {
            e.fire('visibility.change');
        }

        /**
         * Handler onLowBattery state
         */
        function onLowBattery() {
            app.exit();
        }

        /**
         * Binds module event listeners.
         */
        function bindEvents() {
            window.addEventListener('tizenhwkey', onHardwareKeysTap);
            document.addEventListener('visibilitychange', onVisibilityChange);
            sysInfo.listenBatteryLowState();
        }

        /**
         * Inits module.
         */
        function init() {
            bindEvents();
            sysInfo.checkBatteryLowState();
        }

        e.listeners({
            'core.battery.low': onLowBattery
        });

        return {
            init: init
        };
    }

});
