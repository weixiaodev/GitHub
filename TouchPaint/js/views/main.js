/*global define, console, document, tizen, alert, tau*/
/*jslint plusplus: true*/

/**
 * Main page module
 */

define({
    name: 'views/main',
    requires: [
        'core/event',
        'core/application',
        'models/options'
    ],
    def: function viewsMain(req) {
        'use strict';

        var e = req.core.event,
            app = req.core.application,
            o = req.models.options,

            page = null,
            optionsBtn = null,
            clearBtn = null,
            canvas = null,
            context = null,
            alertMessage = null,
            alertOk = null,

            touches = null,
            drawPath = {},
            isMoved = {},
            strokeWidth = null,
            strokeColor = null,
            touchedFooterBtnCounter = 0,

            ADDITIONAL_LINE_WIDTH = 0.5,
            HALF_PIXEL = 0.5;

        /**
         * Gets option values.
         */
        function getOptionValues() {
            strokeWidth = o.getStrokeWidth();
            strokeColor = o.getStrokeColor();
        }

        /**
         * Handles pageshow event.
         */
        function onPageShow() {
            getOptionValues();
        }

        /**
         * Handles click event on option button.
         */
        function onOptionsBtnTap() {
            e.fire('views.options.show');
        }

        /**
         * Handles click event on clear button.
         */
        function onClearBtnTap() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        /**
         * Handles touchstart event on canvas.
         * @param {event} ev
         */
        function onCanvasTouchStart(ev) {
            var touch = ev.changedTouches[0];

            drawPath[touch.identifier] = touch;

            if (!isMoved[touch.identifier]) {
                context.fillStyle = strokeColor;
                context.beginPath();
                context.arc(
                    drawPath[touch.identifier].pageX - canvas.offsetLeft,
                    drawPath[touch.identifier].pageY - canvas.offsetTop,
                    strokeWidth / 2,
                    0,
                    Math.PI * 2,
                    true
                );
                context.closePath();
                context.fill();
            }
        }

        /**
         * Handles touchend event on canvas.
         */
        function onCanvasTouchEnd(ev) {
            var touch = ev.changedTouches[0];

            delete isMoved[touch.identifier];
            delete drawPath[touch.identifier];
        }

        /**
         * Handles touchmove event on canvas.
         */
        function onCanvasTouchMove(ev) {
            var touches = ev.changedTouches,
                touchesLength = touches.length,
                currentDrawPath = null,
                i = 0;

            context.lineWidth = strokeWidth + ADDITIONAL_LINE_WIDTH;
            context.strokeStyle = strokeColor;
            context.lineJoin = 'round';

            for (i = 0; i < touchesLength; i += 1) {
                isMoved[touches[i].identifier] = true;
                currentDrawPath = drawPath[touches[i].identifier];
                if (currentDrawPath !== undefined) {
                    context.beginPath();
                    context.moveTo(
                        currentDrawPath.pageX - canvas.offsetLeft + HALF_PIXEL,
                        currentDrawPath.pageY - canvas.offsetTop + HALF_PIXEL
                    );
                    context.lineTo(
                        touches[i].pageX - canvas.offsetLeft + HALF_PIXEL,
                        touches[i].pageY - canvas.offsetTop + HALF_PIXEL
                    );
                    context.closePath();
                    context.stroke();

                    drawPath[touches[i].identifier] = touches[i];
                }
            }
            ev.preventDefault();
        }

        /**
         * Registers canvas event listeners.
         */
        function addCanvasListeners() {
            canvas.addEventListener('touchstart', onCanvasTouchStart);
            canvas.addEventListener('touchend', onCanvasTouchEnd);
            canvas.addEventListener('touchmove', onCanvasTouchMove);
        }

        /**
         * Removes canvas event listeners.
         */
        function removeCanvasListeners() {
            canvas.removeEventListener('touchstart', onCanvasTouchStart);
            canvas.removeEventListener('touchend', onCanvasTouchEnd);
            canvas.removeEventListener('touchmove', onCanvasTouchMove);
        }

        /**
         * Handles touchstart event on footer button.
         */
        function onFooterBtnTouchStart() {
            touchedFooterBtnCounter += 1;
        }

        /**
         * Handles touchend event on footer button.
         */
        function onFooterBtnTouchEnd() {
            if (touchedFooterBtnCounter > 0) {
                touchedFooterBtnCounter -= 1;
            }
        }

        /**
         * Function called when application visibility state changes
         * (document.visibilityState changed to 'visible' or 'hidden').
         */
        function visibilityChange() {
            if (document.visibilityState !== 'visible') {
                removeCanvasListeners();
            } else {
                touchedFooterBtnCounter = 0;
                addCanvasListeners();
            }
        }

        /**
         * Shows alert popup.
         * @param {string} message
         */
        function showExitAlert(message) {
            alertMessage.innerHTML = message;
            tau.openPopup('#main-alert');
        }

        function exitIfCharging() {
            tizen.systeminfo.getPropertyValue(
                'BATTERY',
                function onValue(battery) {
                    if (!battery.isCharging) {
                        return;
                    }
                    showExitAlert(
                        'This application only runs without charger.' +
                        ' Please unplug your USB charger.'
                    );
                }
            );
        }

        function addUSBListener() {
            tizen.systeminfo.addPropertyValueChangeListener(
                'BATTERY',
                function onValue(battery) {
                    if (battery.isCharging) {
                        exitIfCharging();
                    }
                }
            );
        }

        /**
         * Handles click event on alert OK button.
         */
        function onAlertOkClick() {
            app.exit();
        }

        /**
         * Registers view event listeners.
         */
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            optionsBtn.addEventListener('click', onOptionsBtnTap);
            optionsBtn.addEventListener('touchstart', onFooterBtnTouchStart);
            optionsBtn.addEventListener('touchend', onFooterBtnTouchEnd);
            clearBtn.addEventListener('click', onClearBtnTap);
            clearBtn.addEventListener('touchstart', onFooterBtnTouchStart);
            clearBtn.addEventListener('touchend', onFooterBtnTouchEnd);
            alertOk.addEventListener('click', onAlertOkClick);
            addCanvasListeners();
            addUSBListener();
        }

        /**
         * Inits module.
         */
        function init() {
            page = document.getElementById('main');
            optionsBtn = document.getElementById('main-options-btn');
            clearBtn = document.getElementById('main-clear-btn');
            canvas = document.getElementById('main-canvas');
            context = canvas.getContext('2d');
            alertMessage = document.getElementById('main-alert-message');
            alertOk = document.getElementById('main-alert-ok');
            getOptionValues();
            bindEvents();
            exitIfCharging();
        }

        e.listeners({
            'visibility.change': visibilityChange
        });

        return {
            init: init
        };
    }

});
