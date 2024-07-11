package com.zadanetwork.wallet; // ← Make sure that is your package name

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity; // ← For RN <= 0.59

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish()
    }
}

