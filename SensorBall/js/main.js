/*
 *      Copyright 2013  Samsung Electronics Co., Ltd
 *
 *      Licensed under the Flora License, Version 1.1 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *              http://floralicense.org/license/
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

/*global tizen, navigator, console, clearTimeout, setTimeout, app: true,
window, document, getComputedStyle, alert */

var availWidth = window.innerWidth,
    availHeight = window.innerHeight,
    $id = document.getElementById.bind(document);

var app = {
    sensor: null,
    R: 2000.0, // // gravity constant * m * M

    gameWidth: 0,
    gameHeight: 0,
    ballWidth: 0,
    ballHeight: 0,
    sunWidth: 0,
    sunHeight: 0,
    ballX: 0,
    ballY: 0,
    dX: 0,
    dY: 0,
    sunX: 0,
    sunY: 0,

    ballEl: null,
    sunEl: null,

    backgroundWidth: 0,
    backgroundHeight: 0,
    backgroundTop: 0,
    backgroundLeft: 0,

    resistance: 0.98, // air
    friction: 0.90, // bounce
    sideFriction: 0.95,
    frictionC: 0.002,
    repulse: 0.6,
    cdd: -0.3,

    borderTolerance: 30, // when Earth reach a border, then Earth is "moving"

    timeout: null,
    current: 'ball',
    event: null,
    animationInterval: 40,

    /**
     * Draw earth background position
     * @param {int} x current x earth position
     * @param {int} y current y earth position
     */
    earthUpdateBgPosition: function earthUpdateBgPosition(x, y) {
        'use strict';
        var rX, rY,
            cX, cY,
            tX, tY,
            bdX, bdY,
            br;

        rX = -30.0;
        rY = -30.0;

        cX = (this.gameWidth - this.backgroundWidth) / 2;
        cY = (this.gameHeight - this.backgroundHeight) / 2;

        tX = cX + (-x * rX);
        tY = cY + (y * rY);

        bdX = tX - this.backgroundLeft;
        bdY = tY - this.backgroundTop;

        br = 0.2;

        this.backgroundLeft += bdX * br;
        this.backgroundTop += bdY * br;

        this.contentEl.style.backgroundPosition =
            (this.backgroundLeft - 330) + 'px ' +
                (this.backgroundTop - 330) + 'px';
    },

    getWidth: function getWidth(element) {
        'use strict';
        return parseInt(
            getComputedStyle(element).getPropertyValue('width'),
            10
        );
    },

    getHeight: function getHeight(element) {
        'use strict';
        return parseInt(
            getComputedStyle(element).getPropertyValue('height'),
            10
        );
    },

    readBallSize: function readBallSize() {
        'use strict';
        this.ballWidth = this.getWidth(this.ballEl) || 50;

        this.ballHeight = this.getHeight(this.ballEl) || 50;
    },

    readSunSize: function readSunSize() {
        'use strict';
        this.sunWidth = this.getWidth(this.sunEl);
        this.sunHeight = this.getHeight(this.sunEl);
    },

    removeSun: function removeSun() {
        'use strict';
        if (this.sunEl) {
            this.sunEl.remove();
        }
    },

    setActiveButton: function setActiveButton(id) {
        'use strict';
        $id('btnBall').classList.remove('active');
        $id('btnSky').classList.remove('active');
        $id('btnSpace').classList.remove('active');
        $id(id).classList.add('active');
    },

    /**
     * Draw sun position
     * @param {int} x current x earth position
     * @param {int} y current y earth position
     */
    earthUpdateSunPosition: function earthUpdateSunPosition(x, y) {
        'use strict';
        var rX, rY,
            cX, cY,
            tX, tY,
            bdX, bdY,
            br;

        rX = -8.0;
        rY = -8.0;

        cX = (this.gameWidth - this.sunWidth) / 2;
        cY = (this.gameHeight - this.sunHeight) / 2;

        tX = cX + (-x * rX);
        tY = cY + (y * rY);

        bdX = tX - this.sunX;
        bdY = tY - this.sunY;

        br = 0.2;

        this.sunX += bdX * br;
        this.sunY += bdY * br;

        this.sunEl.style.left = this.sunX + 'px';
        this.sunEl.style.top = this.sunY + 'px';
        this.sunEl.style.display = 'block';
    },

    /**
     * Deceleration - used when the earth leaves the Sun's gravitation
     */
    deceleration: function deceleration() {
        'use strict';
        this.dX *= 0.6;
        this.dY *= 0.6;
    },


    leaveGravitation: function leaveGravitation() {
        'use strict';
        if (this.ballX > (this.gameWidth + this.borderTolerance)) {
            this.ballX = -this.borderTolerance;
            this.deceleration();
        }
        if (this.ballY > (this.gameHeight + this.borderTolerance)) {
            this.ballY = -this.borderTolerance;
            this.deceleration();
        }
        if (this.ballX < -this.borderTolerance) {
            this.ballX = this.gameWidth + this.borderTolerance;
            this.deceleration();
        }
        if (this.ballY < -this.borderTolerance) {
            this.ballY = this.gameHeight + this.borderTolerance;
            this.deceleration();
        }
    },

    /**
     * Draw the next animation frame for the 'earth' tab
     */
    earthEvents: function earthEvents() {
        'use strict';

        var event,
            x,
            y,
            dXl,
            dYl,
            d,
            d2,
            ddx,
            ddy,
            ratio;

        event = this.event;

        x = -event.accelerationIncludingGravity.x;
        y = -event.accelerationIncludingGravity.y;

        // calculate X and Y distances between the Sun and Earth
        dXl = (this.sunX + this.sunWidth / 2 -
            (this.ballX + (this.ballWidth / 2))); // x distance
        dYl = (this.sunY + this.sunHeight / 2 -
            (this.ballY + (this.ballHeight / 2))); // y distance

        if (Math.abs(dXl) < 1) {
            dXl = dXl < 0 ? -1 : 1; // round to 1 * sign
        }
        if (Math.abs(dYl) < 1) {
            dYl = dYl < 0 ? -1 : 1; // round to 1 * sign
        }

        // distance squared
        d2 = Math.pow(dXl, 2) + Math.pow(dYl, 2);
        // distance
        d = Math.sqrt(d2);

        // acceleration is proportional to 1/d2 [a=GM/r^2]
        // X component is also proportional to dXl / d
        ddx = (this.R * dXl) / (d2 * d);
        ddy = (this.R * dYl) / (d2 * d);

        // apply acceleration to speed
        this.dX += ddx;
        this.dY += ddy;

        ratio = Math.sqrt(Math.pow(this.dX, 2) +
                Math.pow(this.dY, 2)) / 25; // max speed

        if (ratio > 1) { // speed limit achieved
            this.dX /= ratio;
            this.dY /= ratio;
        }

        // apply speed to Earth position
        this.ballX += this.dX;
        this.ballY += this.dY;

        // Earth leaves gravitation of the Sun
        this.leaveGravitation();

        // update Earth position
        this.ballEl.style.left = this.ballX + 'px';
        this.ballEl.style.top = this.ballY + 'px';

        // relative depth Sun / Earth
        if (this.dY > 0) {
            this.ballEl.style.zIndex = 100;
        } else {
            this.ballEl.style.zIndex = 20;
        }

        this.earthUpdateBgPosition(x, y);
        this.earthUpdateSunPosition(x, y);
    },

    /**
     *  Checks if the ball already was on the edge in the previous step
     *
     *  If so, this is not a 'real' bounce - the ball is just laying on the edge
     *
     *  @return {Object}
     */
    shouldVibrateIfHitsEdge: function shouldVibrateIfHitsEdge() {
        'use strict';
        var ret = {
            x: true,
            y: true
        };

        if (this.ballX <= 0) {
            ret.x = false;
        } else if ((this.ballX + this.ballWidth) >= this.gameWidth) {
            ret.x = false;
        }
        if (this.ballY <= 0) {
            ret.y = false;
        } else if ((this.ballY + this.ballHeight) >= this.gameHeight) {
            ret.y = false;
        }

        return ret;
    },

    /**
     * Recalculate speed.
     * @return {object} Sides to which the ball sticks.
     */
    recalculateSpeed: function recalculateSpeed() {
        'use strict';
        var stick = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        if (this.ballX < 0) {
            this.ballX = 0;
            this.dX = Math.abs(this.dX) * this.friction - this.frictionC;
            this.dY *= this.sideFriction;
            stick.left = 1;
        } else if ((this.ballX + this.ballWidth) > this.gameWidth) {
            this.ballX = this.gameWidth - this.ballWidth;
            this.dX = -Math.abs(this.dX) * this.friction + this.frictionC;
            this.dY *= this.sideFriction;
            stick.right = 1;
            if (this.ballX < 0) {
                this.ballX = 0;
            }
        }

        if (this.ballY < 0) {
            this.ballY = 0;
            this.dY = Math.abs(this.dY) * this.friction - this.frictionC;
            this.dX *= this.sideFriction;
            stick.top = 1;
        } else if ((this.ballY + this.ballHeight) > this.gameHeight) {
            this.ballY = this.gameHeight - this.ballHeight;
            this.dY = -Math.abs(this.dY) * this.friction + this.frictionC;
            this.dX *= this.sideFriction;
            stick.bottom = 1;
            if (this.ballY < 0) {
                this.ballY = 0;
            }
        }

        return stick;
    },

    /**
     * Draw the next animation frame for the 'ball' tab
     */
    ballEvents: function ballEvents() {
        'use strict';
        var event,
            x,
            y,
            stick = null,
            rX,
            rY,
            ddx,
            ddy,
            shouldVibrate = null,
            isHittingEdge = null;

        event = this.event;

        x = -event.accelerationIncludingGravity.x;
        y = -event.accelerationIncludingGravity.y;

        rX = this.ballX;
        rY = this.ballY;
        ddx = x * -this.cdd;
        ddy = y * this.cdd;
        this.dX += ddx;
        this.dY += ddy;
        this.dX *= this.resistance;
        this.dY *= this.resistance;

        shouldVibrate = this.shouldVibrateIfHitsEdge();

        // update position by current speed value
        this.ballX += this.dX;
        this.ballY += this.dY;

        stick = this.recalculateSpeed();

        isHittingEdge = {
            x: (stick.left || stick.right) && Math.abs(this.dX) > 1,
            y: (stick.top || stick.bottom) && Math.abs(this.dY) > 1
        };

        // if on the edge and the hitting speed is high enough
        if ((shouldVibrate.x && isHittingEdge.x) ||
                (shouldVibrate.y && isHittingEdge.y)) {
            if (typeof navigator.webkitVibrate === 'function') {
                navigator.webkitVibrate(100);
            } else {
                navigator.vibrate(100);
            }
        }

        this.ballEl.style.left = this.ballX + 'px';
        this.ballEl.style.top = this.ballY + 'px';

        rX = this.ballX - rX;
        rY = this.ballY - rY;

    },

    /**
     * Draw the next animation frame
     */
    fun: function fun() {
        'use strict';
        if (this.event) {
            switch (this.current) {
            case 'ball':
                this.ballEvents();
                break;
            case 'earth':
                this.earthEvents();
                break;
            case 'baloon':
                this.ballEvents();
                break;
            default:
                console.warn('Incorrect current mode');
                this.ballEvents();
            }
        }

        // animation - go to next step;
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.fun.bind(this), this.animationInterval);
    },

    /**
     * Switch to the 'ball' tab
     */
    startBall: function startBall() {
        'use strict';

        this.contentEl.classList.remove('background2', 'background3');
        this.contentEl.classList.add('background1');
        this.setActiveButton('btnBall');

        this.gameHeight = this.getHeight(this.contentEl);

        this.cdd = -0.3;
        this.resistance = 0.98;
        this.friction = 0.90;
        this.sideFriction = 0.95;
        this.frictionC = 0.002;

        this.current = 'ball';

        this.removeSun();
        this.ballEl.setAttribute('src', './images/ball1.png');
        this.ballEl.style.width = '43px';
        this.ballEl.style.height = '43px';

        this.contentEl.style.backgroundPosition = '0px -90px';

        this.readBallSize();
    },

    /**
     * Switch to the 'sky' tab
     */
    startSky: function startSky() {
        'use strict';
        this.contentEl.classList.remove('background1', 'background3');
        this.contentEl.classList.add('background2');
        this.setActiveButton('btnSky');

        this.gameHeight = this.getHeight(this.contentEl);

        this.cdd = 0.05;
        this.resistance = 0.90;
        this.friction = 0.98;
        this.sideFriction = 0.95;
        this.frictionC = 0.002;

        this.current = 'baloon';

        this.removeSun();
        this.ballEl.setAttribute('src', './images/balloon.png');
        this.ballEl.style.width = '50px';
        this.ballEl.style.height = '50px';

        this.contentEl.style.backgroundPosition = '0px -80px';

        this.readBallSize();
    },

    /**
     * Switch to the 'space' tab
     */
    startSpace: function startSpace() {
        'use strict';
        var backgroundPosition, arrayPos;

        this.contentEl.classList.remove('background2', 'background1');
        this.contentEl.classList.add('background3');
        this.setActiveButton('btnSpace');

        this.gameHeight = this.getHeight(this.contentEl);

        this.friction = 0.60; // bounce
        this.sideFriction = 0.95;
        this.frictionC = 0.0;

        this.current = 'earth';

        this.ballEl.setAttribute('src', './images/earth.png');

        this.contentEl.innerHTML +=
            '<img id="sun" class="sun" src="' +
                './images/sun.png' +
                '" style="display: none;"></img>';

        this.sunEl = $id('sun');
        this.ballEl = $id('ball');

        this.readSunSize();

        this.sunX = (this.gameWidth - this.sunWidth) / 2;
        this.sunY = (this.gameHeight - this.sunHeight) / 2;

        this.ballEl.style.width = '25px';
        this.ballEl.style.height = '25px';

        this.readBallSize();

        this.contentEl.style.backgroundPosition = '0px 0px';

        backgroundPosition = getComputedStyle(this.contentEl)
                .backgroundPosition;

        arrayPos = backgroundPosition.split(' ');
        this.backgroundTop = parseInt(arrayPos[0], 10);
        this.backgroundLeft = parseInt(arrayPos[1], 10);
        this.backgroundWidth = this.getWidth(app.contentEl);
        this.backgroundHeight = this.getHeight(app.contentEl);
    },

    saveSensorData: function saveSensorData(event) {
        'use strict';
        this.event = event;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    var contentHeight,
        headerHeight = app.getHeight($id('header')),
        footerHeight = app.getHeight($id('footer'));

    if (window.navigator.platform.indexOf('emulated') !== -1) {
        alert('Sensor Ball works only on Target.\nPlease run this on Target.');
        tizen.application.getCurrentApplication().exit();
        return;
    } else {
        document.getElementById('main').classList.remove('hidden');
    }

    app.ballEl = $id('ball');
    app.contentEl = $id('content');

    // set content height
    contentHeight = Math.max(availHeight, 320) - headerHeight - footerHeight;
    $id('content').style.height = contentHeight + 'px';

    // set game area size
    app.gameHeight = contentHeight;
    app.gameWidth = Math.max(availWidth, 320);

    app.readBallSize();

    window.addEventListener(
        'devicemotion',
        app.saveSensorData.bind(app),
        false
    );

    app.fun();

    window.addEventListener('tizenhwkey', function onHwKey(e) {
        if (e.originalEvent.keyName === 'back') {
            tizen.application.getCurrentApplication().exit();
        }
    });

    $id('btnBall').addEventListener('click', function onBtnBallClick() {
        app.startBall();
    });

    $id('btnSky').addEventListener('click', function onBtnSkyClick() {
        app.startSky();
    });

    $id('btnSpace').addEventListener('click', function onBtnSpaceClick() {
        app.startSpace();
    });

    app.startBall();

    document.addEventListener('webkitvisibilitychange', function onVisible() {
        if (document.webkitVisibilityState === 'visible') {
            app.fun();
        }
    });

    document.addEventListener('tizenhwkey', function (e) {
        if (e.keyName === 'back') {
            tizen.application.getCurrentApplication().exit();
        }
    });

    if (typeof tizen === 'object') {
        tizen.power.request('SCREEN', 'SCREEN_NORMAL');
    }

});
