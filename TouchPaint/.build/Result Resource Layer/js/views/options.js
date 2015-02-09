/*global define, console, document, history, tau*/
/*jslint plusplus: true*/

/**
 * Options page module
 */

define({
    name: 'views/options',
    requires: [
        'core/event',
        'models/options'
    ],
    def: function viewsOptions(req) {
        'use strict';

        var e = req.core.event,
            o = req.models.options,

            page = null,
            cancelBtn = null,
            okBtn = null,
            range = null,
            preview = null,
            white = null,
            red = null,
            green = null,
            blue = null;

        /**
         * Handles views.options.show event
         */
        function show() {
            tau.changePage('#options');
        }

        /**
         * Gets options values.
         */
        function getOptionValues() {
            var strokeWidth = o.getStrokeWidth();

            range.value = strokeWidth;
            preview.style.height = strokeWidth + 'px';
            preview.style.backgroundColor = o.getStrokeColor();
        }

        /**
         * Sets options values.
         */
        function setOptionValues() {
            o.setStrokeWidth(range.value);
            o.setStrokeColor(preview.style.backgroundColor);
        }

        /**
         * Handles pageshow event.
         */
        function onPageShow() {
            getOptionValues();
        }

        /**
         * Handles click event on color button.
         */
        function onCancelBtnTap() {
            history.back();
        }

        /**
         * Handles click event on line button.
         */
        function onOkBtnTap() {
            setOptionValues();
            history.back();
        }

        /**
         * Handles change event on range slider.
         */
        function setPreviewHeight(value) {
            preview.style.height = value + 'px';
        }

        /**
         * Handles change event on range slider.
         * @param {event} ev
         */
        function onRangeChange(ev) {
            setPreviewHeight(ev.target.value);
        }

        /**
         * Handles tap event on white.
         */
        function onWhiteTap() {
            console.log('onWhiteTap');
            preview.style.backgroundColor = '#fff';
        }

        /**
         * Handles tap event on white.
         */
        function onRedTap() {
            console.log('onRedTap');
            preview.style.backgroundColor = '#f00';
        }

        /**
         * Handles tap event on white.
         */
        function onGreenTap() {
            console.log('onGreenTap');
            preview.style.backgroundColor = '#0f0';
        }

        /**
         * Handles tap event on white.
         */
        function onBlueTap() {
            console.log('onBlueTap');
            preview.style.backgroundColor = '#00f';
        }

        /**
         * Registers view event listeners.
         */
        function bindEvents() {
            page.addEventListener('pageshow', onPageShow);
            cancelBtn.addEventListener('click', onCancelBtnTap);
            okBtn.addEventListener('click', onOkBtnTap);
            range.addEventListener('change', onRangeChange);
            white.addEventListener('click', onWhiteTap);
            red.addEventListener('click', onRedTap);
            green.addEventListener('click', onGreenTap);
            blue.addEventListener('click', onBlueTap);
        }

        /**
         * Inits module.
         */
        function init() {
            page = document.getElementById('options');
            cancelBtn = document.getElementById('options-cancel-btn');
            okBtn = document.getElementById('options-ok-btn');
            range = document.getElementById('options-range');
            preview = document.getElementById('options-preview');
            white = document.getElementById('options-colors-white');
            red = document.getElementById('options-colors-red');
            green = document.getElementById('options-colors-green');
            blue = document.getElementById('options-colors-blue');
            bindEvents();
        }

        e.listeners({
            'views.options.show': show
        });

        return {
            init: init
        };
    }

});
