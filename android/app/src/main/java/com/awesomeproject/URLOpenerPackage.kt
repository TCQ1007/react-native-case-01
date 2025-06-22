package com.awesomeproject

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class URLOpenerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "URLOpener"
    }
    
    @ReactMethod
    fun openURL(url: String, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            if (intent.resolveActivity(reactApplicationContext.packageManager) != null) {
                reactApplicationContext.startActivity(intent)
                promise.resolve("success")
            } else {
                promise.reject("NO_BROWSER", "没有找到可以打开此链接的应用")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "打开链接失败: ${e.message}")
        }
    }
    
    @ReactMethod
    fun canOpenURL(url: String, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            val canOpen = intent.resolveActivity(reactApplicationContext.packageManager) != null
            promise.resolve(canOpen)
        } catch (e: Exception) {
            promise.reject("ERROR", "检查链接失败: ${e.message}")
        }
    }
}

class URLOpenerPackage : com.facebook.react.ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<com.facebook.react.bridge.NativeModule> {
        return listOf(URLOpenerModule(reactContext))
    }
    
    override fun createViewManagers(reactContext: ReactApplicationContext): List<com.facebook.react.uimanager.ViewManager<*, *>> {
        return emptyList()
    }
}