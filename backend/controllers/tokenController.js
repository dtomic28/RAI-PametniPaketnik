module.exports = {
    default: function (req, res) {
        res.json({ message: 'default function in tokenController'});
    },

    requestToken: function (req, res)  {
        const { username, password , id} = req.body;

        const payload = {
            deliveryId: 12345,
            boxId: boxId,
            tokenFormat: 4,
            latitude: 46.056946,
            longitude: 14.505751,
            qrCodeInfo: null,
            terminalSeed: 111222,
            isMultibox: false,
            doorIndex: 0,
            addAccessLog: true
        };


        res.json({ token });
    }
}

/* code copied from kotlin
            try {
                status = "Connecting to server..."
                val client = OkHttpClient()

                val mediaType = "application/json".toMediaType()
                val requestBody = """
                    {
                      "deliveryId": 12345,
                      "boxId": $boxId,
                      "tokenFormat": 4,
                      "latitude": 46.056946,
                      "longitude": 14.505751,
                      "qrCodeInfo": null,
                      "terminalSeed": 111222,
                      "isMultibox": false,
                      "doorIndex": 0,
                      "addAccessLog": true
                    }
                """.trimIndent().toRequestBody(mediaType)

                status = "Sending request..."
                val request = Request.Builder()
                    .url("https://link_to_company_api")
                    .addHeader("Authorization", "Bearer API KEY HERE")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                if (response.isSuccessful) {
                    status = "Processing response..."
                    val gson = com.google.gson.Gson()
                    val apiResponse = gson.fromJson(responseBody, ApiResponse::class.java)

                    val base64Data = apiResponse.data

                    val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)

                    val success = saveBase64ToFile(context, "test.zip", decodedBytes)

                    if (success) {
                        Log.i("FileSave", "Saved to: ${context.filesDir.absolutePath}/test.zip")
                        val extractDir = File(context.cacheDir, "extracted_audio")
                        extractDir.mkdirs()

                        val extractedFiles = extractZip(context, "test.zip", extractDir)


                        Log.i("ExtractedFiles", extractedFiles.joinToString())

                        if (extractedFiles.contains("token.wav")) {
                            status = "Playing audio..."
                            playAudio(context, File(extractDir, "token.wav").absolutePath)
                            status = "Success! Audio played"
                        } else {
                            status = "Error: No audio file found"
                            Log.e("ZIP", "No audio file found in ZIP archive")
                        }
                    } else {
                        status = "Error: Failed to save file"
                        Log.e("FileSave", "Failed to save file")
                    }
                } else {
                    status = "Error: ${response.code} - ${response.message}"
                }
            } catch (e: Exception) {
                status = "Error: ${e.localizedMessage}"
                Log.e("NetworkError", "Failed to make request", e)
            }
*/