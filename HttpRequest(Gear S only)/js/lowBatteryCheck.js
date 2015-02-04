/*
 * Copyright (C) 2014-2015 Samsung Electronics. All Rights Reserved. Source code is
 * licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * IMPORTANT LICENSE NOTE: The IMAGES AND RESOURCES are licensed under the
 * Creative Commons BY-NC-SA 3.0 License
 * (http://creativecommons.org/licenses/by-nc-sa/3.0/). The source code is
 * allows commercial re-use, but IMAGES and RESOURCES forbids it.
 */

( function () {
	var systeminfo = {

		systeminfo: null,

		lowThreshold : 0.99,

		listenBatteryLowState: function(){
			var self = this;
			this.systeminfo.addPropertyValueChangeListener(
				'BATTERY',
				function change(battery){
					if(!battery.isCharging) {
						tizen.application.getCurrentApplication().exit();
					}
				},
				{
					lowThreshold : self.lowThreshold
				}
			);
		},

		checkBatteryLowState: function(){
			var self = this;
			this.systeminfo.getPropertyValue(
				'BATTERY',
				function(battery) {
					if(battery.level < self.lowThreshold && !battery.isCharging) {
						tizen.application.getCurrentApplication().exit();
					}
				},
				null);
		},

		init: function(){
			if (typeof tizen === 'object' && typeof tizen.systeminfo === 'object'){
				this.systeminfo = tizen.systeminfo;
				this.checkBatteryLowState();
				this.listenBatteryLowState();
			}
			else{
				console.warn('tizen.systeminfo is not available.');
			}
		}
	};

	systeminfo.init();

} () );
