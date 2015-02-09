/*
 * Copyright (C) 2014-2015 Samsung Electronics. All Rights Reserved.
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

package com.samsung.example.gearnotifications;

import java.util.ArrayList;
import java.util.UUID;
import android.util.Log;

import com.samsung.example.gearnotifications.R;

import com.samsung.android.sdk.SsdkUnsupportedException;
import com.samsung.android.sdk.richnotification.actions.SrnHostAction;
import com.samsung.android.sdk.richnotification.actions.SrnRemoteBuiltInAction;
import com.samsung.android.sdk.richnotification.actions.SrnRemoteInputAction;
import com.samsung.android.sdk.richnotification.actions.SrnRemoteLaunchAction;
import com.samsung.android.sdk.richnotification.actions.SrnRemoteBuiltInAction.OperationType;
import com.samsung.android.sdk.richnotification.templates.*;
import com.samsung.android.sdk.richnotification.Srn;
import com.samsung.android.sdk.richnotification.SrnAction;
import com.samsung.android.sdk.richnotification.SrnImageAsset;
import com.samsung.android.sdk.richnotification.SrnRichNotification;
import com.samsung.android.sdk.richnotification.SrnAction.CallbackIntent;
import com.samsung.android.sdk.richnotification.SrnRichNotification.AlertType;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager.ErrorType;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager.EventListener;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager;
import com.samsung.android.sdk.richnotification.actions.SrnRemoteInputAction.KeyboardInputMode;
import com.samsung.android.sdk.richnotification.templates.SrnLargeHeaderTemplate;
import com.samsung.android.sdk.richnotification.templates.SrnStandardSecondaryTemplate;
import com.samsung.android.sdk.richnotification.templates.SrnPrimaryTemplate;
import com.samsung.android.sdk.richnotification.templates.SrnStandardTemplate.HeaderSizeType;

import android.support.v4.app.NotificationCompat;

import android.app.Activity;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.Toast;


public class GearNotifications extends Activity implements OnClickListener, EventListener {
	private Button mDemo1Button, mDemo2Button;
	private NotificationManager mNotiManager;
	SrnRichNotificationManager mRichNotificationManager;
	SrnRichNotification mRichNotification;

	static final int NOTIFICATION_ID = 1;
	private int mNotification = 0;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		mNotiManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

		mDemo1Button = (Button) findViewById(R.id.demo1btn);
		mDemo1Button.setOnClickListener(this);
		mDemo2Button = (Button) findViewById(R.id.demo2btn);
		mDemo2Button.setOnClickListener(this);
		
		initalizeSrn();
		
	}
	
	private void initalizeSrn() {	
		Srn srn = new Srn();
		Toast.makeText(this, "Initalizing Rich Notificaiton.", 
				Toast.LENGTH_LONG).show();

		try {
            // Initialize an instance of Srn.
            srn.initialize(this);
        } catch (SsdkUnsupportedException e) {
        	// Error handling
        	int errType = e.getType();
        	/**
			 * VENDOR_NOT_SUPPORTED: The device is not a Samsung device
			 * DEVICE_NOT_SUPPORTED: The device does not support the Srn package
			 **/
			if (errType == SsdkUnsupportedException.VENDOR_NOT_SUPPORTED)
				Toast.makeText(this, "Not a Samsung device", Toast.LENGTH_SHORT).show();
			else if (errType == SsdkUnsupportedException.DEVICE_NOT_SUPPORTED)
				Toast.makeText(this, "Only supports Android 4.4.2 and up", Toast.LENGTH_SHORT).show();
			else
				Toast.makeText(this, "Failed", Toast.LENGTH_SHORT).show();
		
        	mNotification = 1;
        }

		mRichNotificationManager = new SrnRichNotificationManager(this);
		mRichNotification = new SrnRichNotification(this);
	}
	
	 @Override
     protected void onResume() {
        super.onResume();

        mRichNotificationManager.start();
        mRichNotificationManager.registerRichNotificationListener(this);
     }
	 
	 @Override
	 protected void onPause() {
	    super.onPause();

	    mRichNotificationManager.unregisterRichNotificationListener(this);
	    mRichNotificationManager.stop();
	 }

	 @Override
	 public void onError(UUID arg0, ErrorType arg1) {
	    // TODO Auto-generated method stub
	    Toast.makeText(getApplicationContext(),
	                "Something wrong with uuid" + arg0.toString() + "Error:" + arg1.toString(),
	                Toast.LENGTH_LONG).show();
	 }

	 @Override
	 public void onRead(UUID arg0) {
	    // TODO Auto-generated method stub
	    Toast.makeText(getApplicationContext(), "Read uuid" + arg0.toString(), Toast.LENGTH_LONG)
	                .show();

	 }
	 
	 @Override
	 public void onRemoved(UUID arg0) {
	    // TODO Auto-generated method stub
	    Toast.makeText(getApplicationContext(), "Removed uuid" + arg0.toString(), Toast.LENGTH_LONG)
	              .show();
	 }
	 

	 @Override
	 public void onClick(View v) {
		if (v == mDemo1Button) {
			sendAndroidNotification();
		}  
		else if (v == mDemo2Button) {
			if (mNotification == 0)
				sendRichNotification();
		}
	}
	 
	 /**
	  * Send an <b>Android system notification</b>. This will be sent to the
	  * Gear if the one of the following scenarios are met:
	  * <ul>
	  * <li> Scenario 1 </li>
	  * <li>The application does NOT declare uses-permission
	  * "com.samsung.wmanager.ENABLE_NOTIFICATION"</li>
	  * <li> Comment out mRichNotification.setAssociatedAndroidNotification() 
	  * and mRichNotificationManager.setRouteCondition() lines in the function
	  * below </li>
	  * <li>The app is selected in Gear Manager -> Notification</li>
	  * <li>The phone screen is off or un-check Gear Manager->Notifications->Limit notifications
	  *
	  * <li> Scenario 2 </li>
	  * <li>The application declares uses-permission
	  * "com.samsung.wmanager.ENABLE_NOTIFICATION"</li>
	  * <li> You have included Rich Notification library in your project 
	  * and initialized Rich Notification Framework </li>
	  * <li> Keep mRichNotification.setAssociatedAndroidNotification() 
	  * and mRichNotificationManager.setRouteCondition() lines in the function
	  * below </li>
	  * <li>The phone screen is off or un-check Gear Manager->Notifications->Limit notifications </li>
	  * </ul>
	  */
	 private void sendAndroidNotification() {
		long[] pattern = { 0, 200, 0 };
 		String url = "http://samsungdevcon.com";
	    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
	    PendingIntent content = PendingIntent.getActivity(GearNotifications.this, 0, intent, 0);
					
								
		Notification notification = new NotificationCompat.Builder(
				GearNotifications.this)
		    	.setTicker("SDC")
				.setContentTitle("Samsung Developer Conference")
				.setContentText("Welcome to the global Samsung Developer Conference 2014")
				.setVibrate(pattern)
				.setSmallIcon(R.drawable.sdc)
				.setLargeIcon(BitmapFactory.decodeResource(getResources(),R.drawable.sanfrancisco))
				.setContentIntent(content)
				.build();				
					
		mRichNotification.setAssociatedAndroidNotification(GearNotifications.NOTIFICATION_ID);
		mRichNotificationManager.setRouteCondition(notification);
		mNotiManager.notify(GearNotifications.NOTIFICATION_ID,notification);
	}
	 
	 
	 /**
	     * Create a <b>Rich notification</b>. This will be sent to the
	     * Gear if the following conditions are met:
	     * <ul>
	  	 * <li>The application declares uses-permission
	     * "com.samsung.wmanager.ENABLE_NOTIFICATION"</li>
	     * <li>The application declares uses-permission
	     * "com.samsung.android.providers.context.permission.WRITE_USE_APP_FEATURE_SURVEY"</li>
	     * <li>The phone screen is off or un-check Gear Manager->Notifications->Limit notifications 
	     * </ul>
	     */
	 private void sendRichNotification() {
			//Full Screen Image Template
			Bitmap bgBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.sanfrancisco); 
			SrnStandardTemplate myPrimaryTemplate = new SrnStandardTemplate(HeaderSizeType.FULL_SCREEN); 
			mRichNotification.setTitle("<b>Samsung Developer Conference</b>");
									
			SrnImageAsset myBackgroundImage = new SrnImageAsset(GearNotifications.this, "notification_background", bgBitmap); 
			myPrimaryTemplate.setSubHeader("Nov 11-13, 2014");
			myPrimaryTemplate.setBackgroundImage(myBackgroundImage);
			myPrimaryTemplate.setBody("Welcome to the global Samsung Developer Conference 2014 - our biggest, most comprehensive conference ever! ");
			mRichNotification.setPrimaryTemplate(myPrimaryTemplate); 
																							
			SrnStandardSecondaryTemplate mySecondaryTemplate = new SrnStandardSecondaryTemplate();
			Bitmap myLikesBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.likes);
			SrnImageAsset myLikesImage = new SrnImageAsset(GearNotifications.this, "vote_like", myLikesBitmap); 
			Bitmap myCommentsBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.comments);
			SrnImageAsset myCommentsImage = new SrnImageAsset(GearNotifications.this, "comments", myCommentsBitmap); 
					
			mySecondaryTemplate.setSubHeader("Samsung Dev Con"); 
			mySecondaryTemplate.setBody("Get ready to listen, discuss, learn and network about everything that enables you to participate in the present and future of Connected Living.");
			mySecondaryTemplate.setSmallIcon1(myLikesImage, "256 Likes");
			mySecondaryTemplate.setSmallIcon2(myCommentsImage, "96 Comments");
			mRichNotification.setSecondaryTemplate(mySecondaryTemplate);
			mRichNotification.setAlertType(AlertType.SOUND_AND_VIBRATION);
					
			//Host Action 
			ArrayList<SrnAction> myActions = new ArrayList<SrnAction>();
			SrnHostAction primaryAction = new SrnHostAction("Sign up");  
		    String url = "http://samsungdevcon.com";
		    Intent resultIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
		       
		    Bitmap joinBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.sdc);
			SrnImageAsset joinIcon = new SrnImageAsset(GearNotifications.this, "website", joinBitmap); 
			primaryAction.setIcon(joinIcon);
			primaryAction.setToast("Go to samsungdevcon.com on your host device");
			primaryAction.setCallbackIntent(SrnAction.CallbackIntent.getActivityCallback(resultIntent));
			myActions.add(primaryAction);
			
			//Remote Launch Action
			//Launch Navigator app
			SrnRemoteLaunchAction remoteLaunchAction = new SrnRemoteLaunchAction("Direction");
			remoteLaunchAction.setPackage("grk68HBhDL.Navigator");

			Bitmap mapBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.map);
			SrnImageAsset mapIcon = new SrnImageAsset(GearNotifications.this, "Get There", mapBitmap);
			remoteLaunchAction.setIcon(mapIcon);
			remoteLaunchAction.setMimeType("text/plain");
			remoteLaunchAction.setOperation("http://tizen.org/appcontrol/operation/w-navigation");
			Bundle bundle = new Bundle();
			bundle.putString("search", "Moscone Center West, San Francisco, CA");
			remoteLaunchAction.setExtras(bundle);
			Intent remoteLaunchIntentResult = new Intent(GearNotifications.this, GearNotifications.class);
			remoteLaunchAction.setCallbackIntent(CallbackIntent.getActivityCallback(remoteLaunchIntentResult));
			myActions.add(remoteLaunchAction);
			mRichNotification.addActions(myActions);
			
			//isConnected() can be used to detect if the connected Gear supports Rich Notification
			//if it is a Gear 2, notification will not be sent
			if (mRichNotificationManager.isConnected()){
				Toast.makeText(getApplicationContext(), "Sending Rich Notification",
						   Toast.LENGTH_LONG).show();
				mRichNotificationManager.notify(mRichNotification);
			} else {	
				Toast.makeText(getApplicationContext(), "Notification not sent",
				   Toast.LENGTH_LONG).show();
			}
		}
				
}	

