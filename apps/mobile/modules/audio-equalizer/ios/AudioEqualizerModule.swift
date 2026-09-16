import ExpoModulesCore

public class AudioEqualizerModule: Module {
    public func definition() -> ModuleDefinition {
        Name("AudioEqualizer")

        // Equalizer is not supported on iOS with expo-audio
        // The Equalizer screen is hidden on iOS via Platform.OS check

        Function("setEnabled") { (_ value: Bool) in
            // no-op on iOS
        }

        Function("isEnabled") {
            false
        }

        Function("setBandLevel") { (_ band: Int, _ level: Int) in
            // no-op on iOS
        }

        Function("getBandLevel") { (_ band: Int) in
            0
        }

        Function("getNumberOfBands") {
            0
        }

        Function("getBandFreqRange") { (_ band: Int) in
            [0, 0]
        }

        Function("getPresetNames") {
            [String]()
        }

        Function("setPreset") { (_ presetName: String) in
            // no-op on iOS
        }

        Function("getMinBandLevel") {
            -1500
        }

        Function("getMaxBandLevel") {
            1500
        }
    }
}
