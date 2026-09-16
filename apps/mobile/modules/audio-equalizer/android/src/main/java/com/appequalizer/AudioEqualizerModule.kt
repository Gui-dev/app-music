package com.appequalizer

import android.media.audiofx.Equalizer
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AudioEqualizerModule : Module() {
    private var equalizer: Equalizer? = null
    private var enabled = false

    override fun definition() = ModuleDefinition {
        Name("AudioEqualizer")

        OnCreate {
            try {
                equalizer = Equalizer(0, 0)
            } catch (_: Exception) {
                // Equalizer not supported on this device
            }
        }

        Function("setEnabled") { value: Boolean ->
            equalizer?.let {
                it.enabled = value
                enabled = value
            }
        }

        Function("isEnabled") {
            enabled
        }

        Function("setBandLevel") { band: Int, level: Short ->
            equalizer?.let {
                if (enabled) {
                    it.setBandLevel(band.toShort(), level)
                }
            }
        }

        Function("getBandLevel") { band: Int ->
            equalizer?.let {
                if (enabled) {
                    it.getBandLevel(band.toShort()).toInt()
                } else {
                    0
                }
            } ?: 0
        }

        Function("getNumberOfBands") {
            equalizer?.let {
                it.numberOfBands.toInt()
            } ?: 0
        }

        Function("getBandFreqRange") { band: Int ->
            equalizer?.let {
                val range = it.bandFreqRange(band.toShort())
                listOf(range[0].toInt(), range[1].toInt())
            } ?: listOf(0, 0)
        }

        Function("getPresetNames") {
            equalizer?.let {
                val presets = mutableListOf<String>()
                for (i in 0 until it.numberOfPresets) {
                    presets.add(it.getPresetName(i.toShort()))
                }
                presets
            } ?: emptyList<String>()
        }

        Function("setPreset") { presetName: String ->
            equalizer?.let {
                if (enabled) {
                    for (i in 0 until it.numberOfPresets) {
                        if (it.getPresetName(i.toShort()).equals(presetName, ignoreCase = true)) {
                            it.usePreset(i.toShort())
                            break
                        }
                    }
                }
            }
        }

        Function("getMinBandLevel") {
            equalizer?.let {
                it.bandLevelRange[0].toInt()
            } ?: -1500
        }

        Function("getMaxBandLevel") {
            equalizer?.let {
                it.bandLevelRange[1].toInt()
            } ?: 1500
        }

        OnDestroy {
            equalizer?.release()
            equalizer = null
        }
    }
}
