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

var MAIN = (function main() {
    var moduleName = "MAIN";
    var STRING =  "Hello from Gear";

    var stringSelection = 0;

    var receivedMessageText = document.getElementById('text-message');
    var stepCountText = document.getElementById("step-count");
    var heartRateText = document.getElementById("heartbeat-count");
    var capturedImage = document.getElementById("captured-image");
    var screenLocked = false;
    
    function stepCountListener(stepCount) {
        setStepCountText(stepCount);
        NETWORK.sendStepCount(stepCount);
    }

    function heartRateListener(heartRate) {
        setHeartRateText(heartRate);
        NETWORK.sendHeartRate(heartRate);
    }

    function networkMessageListener(object) {
        var type = object.type;
        if (type == null) {
            console.log("Object type is null");
            return;
        }
       
        switch (type) {
        case NETWORK.MESSAGE_TYPE.TEXT:
            console.log("onReceiveData: TEXT");
            var text = object.text;
            setReceivedMessageText(text);
            break;
        case NETWORK.MESSAGE_TYPE.ERROR:
            var errorMsg = object.error;
            console.log("onReceiveData: ERROR, errorMsg=" + errorMsg);
            alert("Please install linked app");
            break;
        case NETWORK.MESSAGE_TYPE.RESET:
            console.log("onReceiveData: RESET, resetting heartrate/step count");

            HEART_RATE.stop();
            setHeartRateText(HEART_RATE.getHeartRate());
            HEART_RATE.start();

            PEDOMETER.stop();
            setStepCountText(PEDOMETER.getTotalStepCount());
            PEDOMETER.start();
            break;
        case NETWORK.MESSAGE_TYPE.DEVICEMODEL:
        	console.log("onReceiveData: DEVICEMODEL, check connected device model");
        	
        	getDeviceCapability();
        	break;
        default:
            console.log("Received unhandled message type: " + type);
            break;
        }
    }
    
    function getDeviceCapability() {
    	var deviceCapabilities;
    	deviceCapabilities = tizen.systeminfo.getCapabilities();
    	//deviceCapabilities.nfc 
    	
    	if (deviceCapabilities.wifi)
    		NETWORK.sendDeviceModel("Gear S");
    	else
    		NETWORK.sendDeviceModel("Gear 2");
    }

    // Button events
    function onConnectClick() {
        NETWORK.connect();
        
        lockScreen();
    }

    function onDisconnectClick() {
        NETWORK.disconnect(true);
        
        unlockScreen();
    }

    function onSendMessageClick() {
        console.log("onSendMessageClick");

        NETWORK.sendMessage(STRING);
    }

    function onSendImageClick() {
        console.log("onSendImageClick");
    //    var file='img/gear_sample.jpg';
        console.log(capturedImage.src);
         
        var onResolveSuccess = function(file) {
            var filePath = file.toURI();
            console.log("onResolveSuccess: fileURI=" + filePath);

            NETWORK.sendImage(filePath);
        };

        var onResolveError = function(error) {
            console.log(UTILITY.createErrorString("onResolveError", error));
        };

        tizen.filesystem.resolve(capturedImage.src, onResolveSuccess,
                onResolveError, 'r');  
    }

    function onStartHeartRateClick() {
        console.log("onStartHeartRateClick");
        HEART_RATE.start();
    }

    function onStopHeartRateClick() {
        console.log("onStopHeartRateClick");
        HEART_RATE.stop();
    }

    function onCapturedImageClick() {
        console.log("onCapturedImageClick");
        NAVIGATION.openCameraPage();
        CAMERA.init();
    }

    // lock screen
    function lockScreen() {
   	
    	if (!this.screenLocked) {
    		console.log("lockScreen: locking");
    		tizen.power.request("CPU", "CPU_AWAKE");
    		tizen.power.request("SCREEN", "SCREEN_NORMAL");
    		
    		this.screenLocked = true;
    	}
    }
    
    function unlockScreen() {
    	if (this.screenLocked) {
    		console.log("unlockScreen: Unlocking");
    		tizen.power.release("SCREEN");
    		tizen.power.release("CPU");
    	
    		this.screenLocked = false;
    	}
    }
   
    // UI
    function setReceivedMessageText(data) {
        receivedMessageText.innerHTML = data;
    }

    function setStepCountText(count) {
        stepCountText.innerHTML = count;
    }

    function setHeartRateText(heartRate) {
        if (heartRate === 0) {
            heartRate = 'N/A';
        }
        heartRateText.innerHTML = heartRate;
    }

    // Helper
    function onLoad() {
        console.log("onLoad");
        init();
    }

    function onUnload() {
        console.log("onUnload");
    }

    function onHardwareKeysTap(ev) {
        var keyName = ev.keyName;
        var page = document.getElementsByClassName('ui-page-active')[0];
        var pageId = (page && page.id) || '';

        if (keyName === "back") {
            console.log("onHardwareKeysTap: " + keyName);

            if (pageId === 'home') {
                console.log('on home page, app exit');
                tizen.application.getCurrentApplication().exit();
            } else {
                console.log('on camera page, go back');
                NAVIGATION.openHomePage();
            }
        }
    }

    function onBlur() {
        console.log("onBlur");
    }

    function onFocus() {
        console.log("onFocus");
    }

    function onVisibilityChange() {
        if (document[hidden]) {
            console.log("Page hidden");
            destroy();
            CAMERA.onVisibilityChange(false);
        } else {
            console.log("Page shown");
            init();
            CAMERA.onVisibilityChange(true);
        }
    }

    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    function bindEvents() {
        window.addEventListener('load', onLoad);
        window.addEventListener('unload', onUnload);
        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);
        document.addEventListener('tizenhwkey', onHardwareKeysTap);
        document.addEventListener(visibilityChange, onVisibilityChange);

        document.getElementById("connect").addEventListener("click",
                onConnectClick);
        document.getElementById("disconnect").addEventListener("click",
                onDisconnectClick);
        document.getElementById("sendMessage").addEventListener("click",
                onSendMessageClick);
        document.getElementById("sendImage").addEventListener("click",
                onSendImageClick);
        document.getElementById("startHeartRate").addEventListener("click",
                onStartHeartRateClick);
        document.getElementById("stopHeartRate").addEventListener("click",
                onStopHeartRateClick);
        document.getElementById("captured-image").addEventListener("click",
                onCapturedImageClick);
    }

    function init() {
        console.log("init");

        page = document.getElementById('home');

        NETWORK.init(networkMessageListener);
        HEART_RATE.init(heartRateListener);

        PEDOMETER.init(stepCountListener);
        PEDOMETER.start();
        setStepCountText(PEDOMETER.getTotalStepCount());
    }

    function destroy() {
        console.log("destroy");

        NETWORK.destroy();
        HEART_RATE.destroy();
        PEDOMETER.destroy();
    }

    console.log("Loaded module: " + moduleName);
    bindEvents();
}());