package com.quantumshield.sdk

import android.content.Context
import org.tensorflow.lite.Interpreter
import java.nio.ByteBuffer
import java.nio.ByteOrder

class AIEngine(context: Context) {

    private val interpreter: Interpreter

    init {
        val model = loadModel(context)
        interpreter = Interpreter(model)
    }

    private fun loadModel(context: Context): ByteBuffer {
        val inputStream = context.assets.open("model.tflite")
        val bytes = inputStream.readBytes()
        val buffer = ByteBuffer.allocateDirect(bytes.size)
        buffer.order(ByteOrder.nativeOrder())
        buffer.put(bytes)
        return buffer
    }

    /**
     * Ejecuta IA REAL
     * @param value Float normalizado
     * @return score 0.0 – 1.0
     */
    fun analyze(value: Float): Float {
        val input = arrayOf(floatArrayOf(value))
        val output = Array(1) { FloatArray(1) }
        interpreter.run(input, output)
        return output[0][0]
    }
}
