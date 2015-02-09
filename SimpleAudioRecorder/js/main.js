/*
 * Copyright (C) 2015 Samsung Electronics. All Rights Reserved.
 * Source code is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 * IMPORTANT LICENSE NOTE:
 * The IMAGES AND RESOURCES are licensed under the Creative Commons BY-NC-SA 3.0
 * License (http://creativecommons.org/licenses/by-nc-sa/3.0/).
 * The source code is allows commercial re-use, but IMAGES and RESOURCES forbids it.
 */

var simpleAudioRecorder = new (function (navigator) {
    'use strict';

    var cameraControl,
        AUDIO_DEST_PATH = '/opt/usr/media/Sounds/',
        SimpleAudioRecorder = function () {
            this.fileName = '';
            this.fileExtension = 'amr';
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
            return this;
        };

    /**
     * Error printing
     * @param {String} errorMsg Error description or message
     * @param {Event} event Error event
     */
    function onError(errorMsg, event) {
        console.log(errorMsg, event);
    }

    /**
     * Fired when camera control received
     * @param {CameraControl} cameraCtrl
     */
    function onCameraControl(cameraCtrl) {
        console.log('Received camera control object!');
        cameraControl = cameraCtrl;
    }

    /**
     * Fires when access to stream has been received
     */
    function onGetUserMediaSuccess(stream) {
        console.log('Stream received!', stream);
        navigator.tizCamera.createCameraControl(
            stream,
            onCameraControl,
            onError.bind('', 'Couldn\'t get camera!')
        );
    }

    /**
     * Starts camera's control recorder
     */
    function startRecorder() {
        cameraControl.recorder.start(
            function () {
                console.log('Recording to started!');
            },
            onError.bind('', 'Error with starting camera recorder')
        );
    }

    /**
     * Init simple recorder
     */
    SimpleAudioRecorder.prototype.init = function () {
        navigator.getUserMedia(
            {
                audio: true,
                camera: false
            },
            onGetUserMediaSuccess,
            onError.bind('', 'Stream receive error')
        );
    };

    /**
     * Starts recording
     */
    SimpleAudioRecorder.prototype.startRecording = function () {
        this.fileName = 'sar'
            + (new Date()).getTime().toString()
            + '.'
            + this.fileExtension;

        cameraControl.recorder.applySettings(
            {
                fileName: this.fileName,
                recordingFormat: this.fileExtension
            },
            startRecorder,
            onError.bind('', 'There is an error with applying settings to camera')
        );
    };

    /**
     * Stops recording
     */
    SimpleAudioRecorder.prototype.stopRecording = function () {
        cameraControl.recorder.stop(
            function () {
                console.log('Recording stopped!');
            },
            function () {
                console.log('can\'t stop it!');
            }
        );
    };

    /**
     * Returns absolute audio file path
     * @returns {string}
     */
    SimpleAudioRecorder.prototype.getFilePath = function () {
        return AUDIO_DEST_PATH + this.fileName;
    };

    return SimpleAudioRecorder;

}(navigator))();

window.onload = function () {
    'use strict';

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function (e) {
        if (e.keyName === "back") {
            tizen.application.getCurrentApplication().exit();
        }
    });
};
