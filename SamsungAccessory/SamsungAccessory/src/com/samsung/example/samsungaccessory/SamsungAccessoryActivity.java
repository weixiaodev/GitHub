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

package com.samsung.example.samsungaccessory;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.IBinder;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.samsung.example.samsungaccessory.R;
import com.samsung.example.samsungaccessory.backend.SamsungAccessoryService;
import com.samsung.example.samsungaccessory.backend.SamsungAccessoryService.LocalBinder;
import com.samsung.example.samsungaccessory.backend.SamsungAccessoryService.MessageReceiver;
import com.samsung.example.samsungaccessory.utils.Utility;

import java.io.File;

public class SamsungAccessoryActivity extends Activity implements MessageReceiver, OnClickListener {
    private static final String TAG = SamsungAccessoryActivity.class.getSimpleName();

    private SamsungAccessoryService mSamsungAccessoryService;
    private AlertDialog dialog;

    private TextView connectionStatus;
    private TextView receivedMessage;
    private TextView deviceModel;
    private TextView stepsCount;
    private TextView heartbeatCountText;
    private TextView noImage;
    private ImageView image;
    private EditText providerMessage;
    
    private boolean mIsBound = false;
    private boolean mIsConnected = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Utility.logDebug(TAG, "onCreate");
        setContentView(R.layout.activity_samsung_accessory);

        connectionStatus = (TextView) findViewById(R.id.connection_status);
        receivedMessage = (TextView) findViewById(R.id.received_message_text);
        deviceModel = (TextView)findViewById(R.id.connected_device_model);
        stepsCount = (TextView) findViewById(R.id.steps_count);
        heartbeatCountText = (TextView) findViewById(R.id.heartbeat_count);
        image = (ImageView) findViewById(R.id.image);
        noImage = (TextView) findViewById(R.id.text_no_image);
        providerMessage = (EditText) findViewById(R.id.send_message_text);
        
        Button reset = (Button) findViewById(R.id.reset);
        reset.setOnClickListener(this);
        Button sendMessage = (Button) findViewById(R.id.send_message);
    	sendMessage.setOnClickListener(this);
    	Button connectedDevice = (Button) findViewById(R.id.connected_device);
    	connectedDevice.setOnClickListener(this);

        dialog = new AlertDialog.Builder(this).create();

        doBindToSamsungAccessoryService();
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        Utility.logDebug(TAG, "onDestroy");
        doUnbindFromSamsungAccessoryService();
        stopService(new Intent(this, SamsungAccessoryService.class));
        super.onDestroy();
    }

    private ServiceConnection mConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {
            LocalBinder binder = (LocalBinder) service;
            mSamsungAccessoryService = binder.getService();
            mSamsungAccessoryService.registerReceiver(SamsungAccessoryActivity.this);
            mIsBound = true;
            Utility.logInfo(TAG, "Service attached to %s ", className.getClassName());
        }

        @Override
        public void onServiceDisconnected(ComponentName className) {
            mSamsungAccessoryService = null;
            mIsBound = false;
        }
    };

    void doBindToSamsungAccessoryService() {
        Utility.logInfo(TAG, "doBindToSamsungAccessoryService");
        bindService(new Intent(this, SamsungAccessoryService.class), mConnection,
                Context.BIND_AUTO_CREATE);
    }

    void doUnbindFromSamsungAccessoryService() {
        Utility.logInfo(TAG, "doUnbindFromSamsungAccessoryService");
        if (mIsBound) {
            unbindService(mConnection);
            mIsBound = false;
        }
    }

    @Override
    public void onConnectionStatusReceived(final boolean isConnected) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mIsConnected = isConnected;
                if (mIsConnected) {
                    connectionStatus.setText(R.string.connected);
                    connectionStatus
                            .setBackgroundColor(getResources().getColor(R.color.green));
                }
                else {
                    connectionStatus.setText(R.string.disconnected);
                    connectionStatus
                            .setBackgroundColor(getResources().getColor(R.color.red));
                }
            }
        });
    }

    @Override
    public void onMessageReceived(final String consumerMessage) {
        Utility.logDebug(TAG, consumerMessage);
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                receivedMessage.setText(consumerMessage);
            }
        });

    }
    
    @Override
    public void onDeviceModelReceived(final String deviceModelText) {
    	Utility.logDebug(TAG, deviceModelText);
    	runOnUiThread(new Runnable() {
    		@Override
    		public void run() {
    			deviceModel.setText(deviceModelText);
    		}
    	});
    }

    @Override
    public void onHeartbeatsReceived(final int count) {
        Utility.logDebug(TAG, "onHeartbeatCountReceived: %s", Integer.toString(count));
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                heartbeatCountText.setText(Integer.toString(count));
            }
        });
    }

    @Override
    public void onStepsReceived(final int count) {
        Utility.logDebug(TAG, "onStepCountReceived: %s", Integer.toString(count));
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                stepsCount.setText(Integer.toString(count));
            }
        });
    }

    @Override
    public void setImage(final String path) {
        Utility.logDebug(TAG, "setImage, path=%s", path);
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                File file = new File(path);
                BitmapFactory.Options options;

                if (file.exists()) {
                	options = new BitmapFactory.Options();
                    options.inSampleSize = 2;
                     
                    Bitmap bitmap = BitmapFactory.decodeFile(file.getAbsolutePath(), options);
                    image.setImageBitmap(bitmap);
                    image.setScaleType(ImageView.ScaleType.FIT_XY);

                //    noImage.setVisibility(View.GONE);
                }

            }
        });
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.send_message:
                String text = providerMessage.getText().toString();
                if (mIsConnected) {
                	Utility.logDebug(TAG, "Send message clicked. Text is \"%s\"", text);
                	mSamsungAccessoryService.sendMessage(text);
                }
                break;
            case R.id.connected_device:
            	if (mIsConnected) {
                	Utility.logDebug(TAG, "Check connected Gear model");
                	mSamsungAccessoryService.sendCheckDeviceModelMessage();
            	}
            	break;
            case R.id.reset:
            	if (mIsConnected) {
                    mSamsungAccessoryService.sendResetCountMessage();
                    onHeartbeatsReceived(0);
                    onStepsReceived(0);
                    break;
                }
                Toast.makeText(this, R.string.reset_count_failure, Toast.LENGTH_LONG).show();
                break;
            default:
                break;
        }
    }
}
