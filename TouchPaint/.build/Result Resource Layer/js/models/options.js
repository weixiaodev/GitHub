/*global define, console*/
/*jslint plusplus: true*/

/**
 * Options module
 */

define({
    name: 'models/options',
    requires: [],
    def: function modelsOptions() {
        'use strict';

        var DEFAULT_STROKE_WIDTH = 1,
            DEFAULT_STROKE_COLOR = '#fff',

            strokeWidth = DEFAULT_STROKE_WIDTH,
            strokeColor = DEFAULT_STROKE_COLOR;

        /**
         * Returns stroke width.
         */
        function getStrokeWidth() {
            return strokeWidth;
        }

        /**
         * Sets stroke width.
         */
        function setStrokeWidth(value) {
            strokeWidth = parseFloat(value);
        }

        /**
         * Returns stroke color.
         */
        function getStrokeColor() {
            return strokeColor;
        }

        /**
         * Sets stroke color.
         */
        function setStrokeColor(value) {
            strokeColor = value;
        }

        return {
            getStrokeWidth: getStrokeWidth,
            setStrokeWidth: setStrokeWidth,
            getStrokeColor: getStrokeColor,
            setStrokeColor: setStrokeColor
        };
    }

});
