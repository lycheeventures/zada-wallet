package com.zadanetwork.wallet

import android.content.ContentValues
import android.os.Environment
import android.provider.MediaStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream
import java.io.OutputStream

class PdfDownloadModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PdfDownload"

    @ReactMethod
    fun savePdfToDownloads(filePath: String, fileName: String, promise: Promise) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "PDF file not found")
                return
            }

            val resolver = reactContext.contentResolver

            // Add timestamp to filename to avoid MediaStore conflicts
            val timestamp = System.currentTimeMillis()
            val displayName = if (fileName.endsWith(".pdf"))
                "${fileName.removeSuffix(".pdf")}_$timestamp.pdf"
            else
                "${fileName}_$timestamp.pdf"

            // MediaStore config (required for Android 10+)
            val values = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, displayName)
                put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                put(MediaStore.MediaColumns.IS_PENDING, 1)
            }

            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                ?: throw Exception("Failed to create MediaStore record")

            resolver.openOutputStream(uri)?.use { outStream: OutputStream ->
                FileInputStream(file).use { input ->
                    input.copyTo(outStream)
                }
            }

            // Mark file as ready
            values.clear()
            values.put(MediaStore.MediaColumns.IS_PENDING, 0)
            resolver.update(uri, values, null, null)

            // Optional: delete temp PDF
            file.delete()

            promise.resolve("PDF saved to Downloads as $displayName")
        } catch (e: Exception) {
            promise.reject("SAVE_FAILED", e.localizedMessage, e)
        }
    }
}
