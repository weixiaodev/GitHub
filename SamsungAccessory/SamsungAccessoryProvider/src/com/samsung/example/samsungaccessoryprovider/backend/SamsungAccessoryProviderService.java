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

package com.samsung.example.samsungaccessoryprovider.backend;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.widget.Toast;

import com.samsung.android.sdk.SsdkUnsupportedException;
import com.samsung.android.sdk.accessory.SA;
import com.samsung.android.sdk.accessory.SAAgent;
import com.samsung.android.sdk.accessory.SAPeerAgent;
import com.samsung.android.sdk.accessory.SASocket;
import com.samsung.android.sdk.accessoryfiletransfer.SAFileTransfer;
import com.samsung.android.sdk.accessoryfiletransfer.SAFileTransfer.EventListener;
import com.samsung.android.sdk.accessoryfiletransfer.SAft;
import com.samsung.example.samsungaccessoryprovider.R;
import com.samsung.example.samsungaccessoryprovider.utils.Utility;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.HashMap;

public class SamsungAccessoryProviderService extends SAAgent {
    private static final String TAG = SamsungAccessoryProviderService.class.getSimpleName();
    private static final String SAMSUNG_ACCESSORY_LINKED_PACKAGE_NAME = "com.samsung.example.samsungaccessory";
    private static final String BUNDLE_DATA = "bundle_data";
    private static final int SAMSUNGACCESSORY_CHANNEL_ID = 104;
    private static final int MSG_REGISTER_CLIENT = 1;
    private static final int MSG_UNREGISTER_CLIENT = 2;
    private static final int MSG_TO_SAMSUNGACCESSORYPROVIDERSERVICE = 3;
    private static final int MSG_TO_SAMSUNGACCESSORYSERVICE = 4;

    private boolean mBound = false;
    private Messenger mSamsungAccessoryMessenger = null;
    private final Messenger mMessenger = new Messenger(new IncomingHandler(this));
    private SamsungAccessoryProviderConnection myConnection = null;

    private HashMap<Integer, SamsungAccessoryProviderConnection> mConnectionsMap = null;

    private SAFileTransfer mSAFileTransfer = null;
    private EventListener mCallback;
    private final String mFileDestPath = Environment.getExternalStoragePublicDirectory(
            Environment.DIRECTORY_DCIM).getAbsolutePath() + File.separator
            + "temp.jpg";

    public static final int TYPE_CONNECTION_STATUS = 0;
    public static final int TYPE_HEARTBEAT_COUNT = 1;
    public static final int TYPE_STEPS_COUNT = 2;
    public static final int TYPE_TEXT = 3;
    public static final int TYPE_FILE_PATH = 4;
    public static final int TYPE_ERROR = 5;
    public static final int TYPE_RESET = 6;
    public static final int TYPE_DEVICEMODEL = 7;

    static class IncomingHandler extends Handler {
        private final WeakReference<SamsungAccessoryProviderService> mService;

        IncomingHandler(SamsungAccessoryProviderService service) {
            mService = new WeakReference<SamsungAccessoryProviderService>(service);
        }

        @Override
        public void handleMessage(Message msg) {
            Utility.logDebug(TAG, "handleMessage: receive msg from samsung accessory service");
            SamsungAccessoryProviderService service = mService.get();
            if (service != null) {
                service.handleMessage(msg);
            } else {
                Utility.logError(TAG, "service is null, discard message");
            }
        }
    }

    public void handleMessage(Message msg) {
        Bundle data;
        switch (msg.what) {
             case MSG_TO_SAMSUNGACCESSORYPROVIDERSERVICE:
                Utility.logDebug(TAG, "MSG_TO_SAMSUNGACCESSORYPROVIDERSERVICE");
                Utility.logDebug(TAG, "Send message to consumer");
                data = msg.getData();
                String str = data.getString(BUNDLE_DATA);
                sendToConsumer(str);
                break;
            case MSG_REGISTER_CLIENT:
                Utility.logDebug(TAG, "MSG_REGISTER_CLIENT");
                mSamsungAccessoryMessenger = msg.replyTo;
                mBound = true;
                if (myConnection != null) {
                    JSONObject jObj2 = createConnectionStatusJSONObject(true);
                    sendToSamsungAccessoryService(jObj2.toString());
                }
                break;
            case MSG_UNREGISTER_CLIENT:
                Utility.logDebug(TAG, "MSG_UNREGISTER_CLIENT");
                mSamsungAccessoryMessenger = null;
                mBound = false;
                break;
            default:
                Utility.logError(TAG, "Unsupported message");
                break;
        }
    }

    public SamsungAccessoryProviderService() {
        super(TAG, SamsungAccessoryProviderConnection.class);
    }

    public class SamsungAccessoryProviderConnection extends SASocket {
        private int mConnectionId;

        public SamsungAccessoryProviderConnection() {
            super(SamsungAccessoryProviderConnection.class.getName());
        }

        @Override
        public void onError(int channelId, String errorString, int error) {
            Utility.logError(TAG, "Connection is not alive. error: %s (%d)", errorString, error);
        }

        @Override
        public void onReceive(int channelId, byte[] data) {
            String str = new String(data);
            Utility.logDebug(TAG, "onReceive: channelId: %d, data: %s", channelId, str);

            if (channelId == SAMSUNGACCESSORY_CHANNEL_ID) {
                if (sendToSamsungAccessoryService(str) == false) {
                    Utility.logError(TAG,
                            "fails sending data to samsung accessory app, send Error to consumer");
                    JSONObject jObj = createErrorJSONObject("binding error or linked app doesn't exist");
                    sendToConsumer(jObj.toString());
                }
            }
        }

        @Override
        protected void onServiceConnectionLost(int result) {
            switch (result) {
                case SASocket.CONNECTION_LOST_DEVICE_DETACHED:
                    Utility.logError(TAG,
                            "onServiceConnectionLost: CONNECTION_LOST_DEVICE_DETACHED");
                    break;
                case SASocket.CONNECTION_LOST_PEER_DISCONNECTED:
                    Utility.logError(TAG,
                            "onServiceConnectionLost: CONNECTION_LOST_PEER_DISCONNECTED");
                    break;
                case SASocket.CONNECTION_LOST_RETRANSMISSION_FAILED:
                    Utility.logError(TAG,
                            "onServiceConnectionLost: CONNECTION_LOST_RETRANSMISSION_FAILED");
                    break;
                case SASocket.CONNECTION_LOST_UNKNOWN_REASON:
                    Utility.logError(TAG,
                            "onServiceConnectionLost: CONNECTION_LOST_UNKNOWN_REASON");
                    break;
                case SASocket.ERROR_FATAL:
                    Utility.logError(TAG,
                            "onServiceConnectionLost: ERROR_FATAL");
                    break;
                default:
                    Utility.logError(TAG,
                            "onServiceConnectionLost: unknown result (%d)", result);
                    break;
            }
            myConnection = null;
            JSONObject jObj = createConnectionStatusJSONObject(false);
            sendToSamsungAccessoryService(jObj.toString());

            if (mConnectionsMap != null) {
                mConnectionsMap.remove(mConnectionId);
            }
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Utility.logDebug(TAG, "onCreate");
        SA mAccessory = new SA();
        try {
            mAccessory.initialize(this);
            boolean isInstalled = isAppInstalled(SAMSUNG_ACCESSORY_LINKED_PACKAGE_NAME);
            if (isInstalled) {
                Utility.logDebug(TAG, "samsung accessory app is installed");
                Intent intent = new Intent("com.samsung.example.samsungaccessory.SamsungAccessoryService");
                this.startService(intent);
            }
            else {
                Utility.logDebug(TAG, "samsung accessory app is not installed yet");
            }
        } catch (SsdkUnsupportedException e) {
            Utility.logError(TAG, "", e);
        } catch (Exception e1) {
            Utility.logError(TAG, "Cannot initialize SAccessory package.", e1);
            stopSelf();
        }
        registerForFileTransfer();
    }

    @Override
    public IBinder onBind(Intent intent) {
        Utility.logDebug(TAG, "onBind");
        return mMessenger.getBinder();
    }

    @Override
    public void onDestroy() {
        Utility.logDebug(TAG, "onDestroy");
        super.onDestroy();
    }

    private boolean isAppInstalled(String uri) {
        PackageManager pm = getPackageManager();

        try {
            pm.getPackageInfo(uri, PackageManager.GET_ACTIVITIES);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            Utility.logError(TAG, "", e);
            return false;
        }
    }

    @Override
    protected void onServiceConnectionRequested(SAPeerAgent peerAgent) {
        Utility.logDebug("onServiceConnectionRequested: peerAgent [appName:%s, getPeerId:%s]",
                peerAgent.getAppName(), peerAgent.getPeerId());
        acceptServiceConnectionRequest(peerAgent);
    }

    @Override
    protected void onFindPeerAgentResponse(SAPeerAgent arg0, int result) {
        Utility.logDebug(TAG, "onFindPeerAgentResponse: result (%d)", result);
    }

    private JSONObject createConnectionStatusJSONObject(boolean isConnected) {
        JSONObject jObj = new JSONObject();
        try {
            jObj.put("type", TYPE_CONNECTION_STATUS);
            jObj.put("connection", isConnected);
        } catch (JSONException e) {
            Utility.logError(TAG, "", e);
        }
        return jObj;
    }

    private JSONObject createErrorJSONObject(String str) {
        JSONObject jObj = new JSONObject();
        try {
            jObj.put("type", TYPE_ERROR);
            jObj.put("error", str);
        } catch (JSONException e) {
            Utility.logError(TAG, "", e);
        }
        return jObj;
    }

    private JSONObject createFileNameJSONObject(String filename) {
        JSONObject jObj = new JSONObject();
        try {
            jObj.put("type", TYPE_FILE_PATH);
            jObj.put("filename", filename);
        } catch (JSONException e) {
            Utility.logError(TAG, "", e);
        }
        return jObj;
    }

    @Override
    protected void onServiceConnectionResponse(SASocket thisConnection, int result) {
        if (result == CONNECTION_SUCCESS) {
            if (thisConnection != null) {
                Utility.logDebug(TAG, "SA Socket connection established");
                myConnection = (SamsungAccessoryProviderConnection) thisConnection;

                if (mConnectionsMap == null) {
                    mConnectionsMap = new HashMap<Integer, SamsungAccessoryProviderConnection>();
                }

                myConnection.mConnectionId = (int) (System.currentTimeMillis() & 255);
                Utility.logDebug(TAG, "onServiceConnectionResponse connectionID = (%d)",
                        myConnection.mConnectionId);
                mConnectionsMap.put(myConnection.mConnectionId, myConnection);
                Toast.makeText(getBaseContext(), R.string.connection_established_message,
                        Toast.LENGTH_LONG)
                        .show();

                JSONObject jObj = createConnectionStatusJSONObject(true);
                sendToSamsungAccessoryService(jObj.toString());
            } else {
                Utility.logError(TAG, "SASocket object is null");
            }
        } else if (result == CONNECTION_ALREADY_EXIST) {
            Utility.logDebug(TAG, "onServiceConnectionResponse, CONNECTION_ALREADY_EXIST");
            JSONObject jObj = createConnectionStatusJSONObject(true);
            sendToSamsungAccessoryService(jObj.toString());
        } else {
            switch (result) {
                case SAAgent.CONNECTION_FAILURE_NETWORK:
                    Utility.logError(TAG, "onServiceConnectionResponse: CONNECTION_FAILURE_NETWORK");
                    break;
                case SAAgent.CONNECTION_FAILURE_DEVICE_UNREACHABLE:
                    Utility.logError(TAG,
                            "onServiceConnectionResponse: CONNECTION_FAILURE_DEVICE_UNREACHABLE");
                    break;
                case SAAgent.CONNECTION_FAILURE_INVALID_PEERAGENT:
                    Utility.logError(TAG,
                            "onServiceConnectionResponse: CONNECTION_FAILURE_INVALID_PEERAGENT");
                    break;
                case SAAgent.CONNECTION_FAILURE_PEERAGENT_NO_RESPONSE:
                    Utility.logError(TAG,
                            "onServiceConnectionResponse: CONNECTION_FAILURE_PEERAGENT_NO_RESPONSE");
                    break;
                case SAAgent.CONNECTION_FAILURE_PEERAGENT_REJECTED:
                    Utility.logError(TAG,
                            "onServiceConnectionResponse: CONNECTION_FAILURE_PEERAGENT_REJECTED");
                    break;
                default:
                    Utility.logError(TAG,
                            "onServiceConnectionResponse: unknown result (%d)", result);
                    break;
            }
        }
    }

    private boolean sendToSamsungAccessoryService(String data) {

        if (mSamsungAccessoryMessenger == null || mBound == false) {
            Utility.logError(TAG, "mSamsungAccessoryMessenger is null or mBound is false, return false");
            return false;
        }
        Bundle providerData = new Bundle(1);
        providerData.putString(BUNDLE_DATA, data);
        Message providerMsg = Message.obtain(null, MSG_TO_SAMSUNGACCESSORYSERVICE, 0, 0);
        providerMsg.setData(providerData);

        try {
            mSamsungAccessoryMessenger.send(providerMsg);
            Utility.logDebug(TAG, "MSG_TO_SAMSUNGACCESSORYSERVICE");
        } catch (RemoteException e) {
            Utility.logError(TAG, "", e);
            return false;
        }
        return true;
    }

    public boolean sendToConsumer(String data) {
        if (data == null) {
            Utility.logError(TAG, "data is null");
            return false;
        }
        Utility.logDebug(TAG, "sendToConsumer: data = " + data);
        if (myConnection == null || data == null) {
            Utility.logError(TAG, "myConnection is null");
            return false;
        }
        else {
            try {
                myConnection.send(SAMSUNGACCESSORY_CHANNEL_ID, data.getBytes());
            } catch (IOException e) {
                Utility.logError(TAG, "", e);
            }
            return true;
        }
    }

    public void registerForFileTransfer() {
        Utility.logDebug(TAG, "registerForFileTransfer");
        mCallback = new EventListener() {
            @Override
            public void onProgressChanged(int transId, int progress) {
                Utility.logDebug(TAG, "onTransferProgress: transId(%d), progress(%d)", progress,
                        transId);
            }

            @Override
            public void onTransferCompleted(int transId, String fileName, int errorCode) {
                Utility.logDebug(TAG,
                        "onTransferComplete: transId(%d), filename(%s), errorCode(%d)", transId,
                        fileName, errorCode);

                if (errorCode == SAFileTransfer.ERROR_NONE) {
                    JSONObject jObj = createFileNameJSONObject(fileName);
                    if (sendToSamsungAccessoryService(jObj.toString()) == false) {
                        Utility.logError(TAG,
                                "fails sending file to samsung accessory app, send Error to consumer");
                        JSONObject jObjErr = createErrorJSONObject("binding error or linked app doesn't exist");
                        sendToConsumer(jObjErr.toString());
                    }
                }
            }

            @Override
            public void onTransferRequested(int id, String fileName) {
                Utility.logDebug(TAG, "receiving file : transId: (%d) filename (%s)", id, fileName);
                if (mSAFileTransfer != null)
                    mSAFileTransfer.receive(id, getDestFilePath());
            }

        };

        SAft SAftPkg = new SAft();
        try {
            SAftPkg.initialize(this);
        } catch (SsdkUnsupportedException e) {
            if (e.getType() == SsdkUnsupportedException.DEVICE_NOT_SUPPORTED) {
                Toast.makeText(getBaseContext(), "Cannot initialize, DEVICE_NOT_SUPPORTED",
                        Toast.LENGTH_SHORT).show();
            } else if (e.getType() == SsdkUnsupportedException.VENDOR_NOT_SUPPORTED) {
            	Toast.makeText(getBaseContext(), "Cannot initialize, VENDOR_NOT_SUPPORTED",
                        Toast.LENGTH_SHORT).show();
            } else if (e.getType() == SsdkUnsupportedException.LIBRARY_NOT_INSTALLED) {
                Toast.makeText(getBaseContext(), "Cannot initialize, LIBRARY_NOT_INSTALLED.",
                        Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(getBaseContext(), "Cannot initialize, unknown.", Toast.LENGTH_SHORT)
                        .show();
            }
            Utility.logError(TAG, "", e);
            return;
        } catch (Exception e1) {
            Toast.makeText(getBaseContext(), "Cannot initialize, SAFileTransfer.",
                    Toast.LENGTH_SHORT).show();
            Utility.logError(TAG, "", e1);
            return;
        }

        mSAFileTransfer = new SAFileTransfer(SamsungAccessoryProviderService.this, mCallback);
    }

    private String getDestFilePath() {
        File file = new File(mFileDestPath);
        if (file.exists() == true) {
            file.delete();
        }
        return mFileDestPath;
    }
}
