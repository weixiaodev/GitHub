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

window.onload = function () {
    // TODO:: Do your initialization job

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back")
            tizen.application.getCurrentApplication().exit();
    });
    
    var log = function(str) {
    	var element = document.createElement('div');
    	element.innerHTML = str;
    	document.body.appendChild(element)
    };
    
    var deviceCapabilities;
    deviceCapabilities = tizen.systeminfo.getCapabilities();
    deviceCapabilities.bluetooth ? log("Bluetooth is supported") : log("Bluetooth is NOT supported");
    deviceCapabilities.nfc ? log("nfc is supported") : log("nfc is NOT supported");
    deviceCapabilities.nfcReservedPush  ? log("nfcReservedPush  is supported") : log("nfcReservedPush  is NOT supported");
    deviceCapabilities.multiTouchCount ? log("multiTouchCount is supported") : log("multiTouchCount is NOT supported");
    deviceCapabilities.inputKeyboard ? log("inputKeyboard is supported") : log("inputKeyboard is NOT supported");
    deviceCapabilities.inputKeyboardLayout ? log("inputKeyboardLayout is supported") : log("inputKeyboardLayout is NOT supported");
    deviceCapabilities.wifi ? log("wifi is supported") : log("wifi is NOT supported");
    deviceCapabilities.wifiDirect ? log("wifiDirect is supported") : log("wifiDirect is NOT supported");
    deviceCapabilities.opengles ? log("opengles is supported") : log("opengles is NOT supported");
    deviceCapabilities.openglestextureFormat ? log("openglestextureFormat is supported (" + deviceCapabilities.openglestextureFormat + ")") : log("openglestextureFormat is NOT supported");
    deviceCapabilities.openglesVersion1_1 ? log("openglesVersion1_1 is supported") : log("openglesVersion1_1 is NOT supported");
    deviceCapabilities.openglesVersion2_0 ? log("openglesVersion2_0 is supported") : log("openglesVersion2_0 is NOT supported");
    deviceCapabilities.fmRadio ? log("fmRadio is supported") : log("fmRadio is NOT supported");
    
    deviceCapabilities.camera ? log("camera is supported") : log("camera is NOT supported");
    deviceCapabilities.cameraFront ? log("cameraFront is supported") : log("cameraFront is NOT supported");
    deviceCapabilities.cameraFrontFlash ? log("cameraFrontFlash is supported") : log("cameraFrontFlash is NOT supported");
    deviceCapabilities.cameraBack ? log("cameraBack is supported") : log("cameraBack is NOT supported");
    deviceCapabilities.cameraBackFlash ? log("cameraBackFlash is supported") : log("cameraBackFlash is NOT supported");
    deviceCapabilities.location ? log("location is supported") : log("location is NOT supported");
    deviceCapabilities.locationGps ? log("locationGps is supported") : log("locationGps is NOT supported");
    deviceCapabilities.locationWps ? log("locationWps is supported") : log("locationWps is NOT supported");
    deviceCapabilities.microphone ? log("microphone is supported") : log("microphone is NOT supported");
    deviceCapabilities.usbHost ? log("usbHost is supported") : log("usbHost is NOT supported");
    deviceCapabilities.usbAccessory ? log("usbAccessory is supported") : log("usbAccessory is NOT supported");
    deviceCapabilities.screenOutputRca ? log("screenOutputRca is supported") : log("screenOutputRca is NOT supported");
    deviceCapabilities.screenOutputHdmi ? log("screenOutputHdmi is supported") : log("screenOutputHdmi is NOT supported");
    
    deviceCapabilities.platformCoreCpuArch ? log("platformCoreCpuArch is (" + deviceCapabilities.platformCoreCpuArch + ")") : log("platformCoreCpuArch is NOT supported");
    deviceCapabilities.platformCoreFpuArch ? log("platformCoreFpuArch is (" + deviceCapabilities.platformCoreFpuArch + ")") : log("platformCoreFpuArch is NOT suppplatformCoreCpuArchorted");
    deviceCapabilities.duid ? log("duid is (" + deviceCapabilities.duid + ")") : log("duid is NOT supported");

    deviceCapabilities.sipVoip ? log("sipVoip is supported") : log("sipVoip is NOT supported");
    deviceCapabilities.speechRecognition ? log("speechRecognition is supported") : log("speechRecognition is NOT supported");
    deviceCapabilities.speechSynthesis ? log("speechSynthesis is supported") : log("speechSynthesis is NOT supported");
    deviceCapabilities.accelerometer ? log("accelerometer is supported") : log("accelerometer is NOT supported");
    deviceCapabilities.accelerometerWakeup ? log("accelerometerWakeup is supported") : log("accelerometerWakeup is NOT supported");
    deviceCapabilities.barometerWakeup ? log("barometerWakeup is supported") : log("barometerWakeup is NOT supported");
    deviceCapabilities.gyroscope ? log("gyroscope is supported") : log("gyroscope is NOT supported");
    deviceCapabilities.gyroscopeWakeup ? log("gyroscopeWakeup is supported") : log("gyroscopeWakeup is NOT supported");
    deviceCapabilities.magnetometer ? log("magnetometer is supported") : log("magnetometer is NOT supported");
    deviceCapabilities.magnetometerWakeup ? log("magnetometerWakeup is supported") : log("magnetometerWakeup is NOT supported");
    deviceCapabilities.photometer ? log("photometer is supported") : log("photometer is NOT supported");
    deviceCapabilities.photometerWakeup ? log("photometerWakeup is supported") : log("photometerWakeup is NOT supported");
    deviceCapabilities.proximity ? log("proximity is supported") : log("proximity is NOT supported");
    deviceCapabilities.proximityWakeup ? log("proximityWakeup is supported") : log("proximityWakeup is NOT supported");
    deviceCapabilities.tiltmeter ? log("tiltmeter is supported") : log("tiltmeter is NOT supported");
    deviceCapabilities.tiltmeterWakeup ? log("tiltmeterWakeup is supported") : log("tiltmeterWakeup is NOT supported");
    deviceCapabilities.dataEncryption ? log("dataEncryption is supported") : log("dataEncryption is NOT supported");
    deviceCapabilities.graphicsAcceleration ? log("graphicsAcceleration is supported") : log("graphicsAcceleration is NOT supported");
    deviceCapabilities.push ? log("push is supported") : log("push is NOT supported");
    deviceCapabilities.telephony ? log("telephony is supported") : log("telephony is NOT supported");
    deviceCapabilities.telephonyMms ? log("telephonyMms is supported") : log("telephonyMms is NOT supported");
    deviceCapabilities.telephonySms ? log("telephonySms is supported") : log("telephonySms is NOT supported");
    deviceCapabilities.screenSizeNormal ? log("screenSizeNormal is supported") : log("screenSizeNormal is NOT supported");
    deviceCapabilities.screenSize480_800 ? log("screenSize480_800 is supported") : log("screenSize480_800 is NOT supported");
    deviceCapabilities.screenSize720_1280 ? log("screenSize720_1280 is supported") : log("screenSize720_1280 is NOT supported");
    deviceCapabilities.autoRotation ? log("autoRotation is supported") : log("autoRotation is NOT supported");
    deviceCapabilities.shellAppWidget ? log("shellAppWidget is supported") : log("shellAppWidget is NOT supported");
    deviceCapabilities.visionImageRecognition ? log("visionImageRecognition is supported") : log("visionImageRecognition is NOT supported");
    deviceCapabilities.visionQrcodeGeneration ? log("visionQrcodeGeneration is supported") : log("visionQrcodeGeneration is NOT supported");
    deviceCapabilities.visionQrcodeRecognition ? log("visionQrcodeRecognition is supported") : log("visionQrcodeRecognition is NOT supported");
    deviceCapabilities.visionFaceRecognition ? log("visionFaceRecognition is supported") : log("visionFaceRecognition is NOT supported");
    deviceCapabilities.secureElement ? log("secureElement is supported") : log("secureElement is NOT supported");
    deviceCapabilities.nativeOspCompatible ? log("nativeOspCompatible is supported") : log("nativeOspCompatible is NOT supported");
};
