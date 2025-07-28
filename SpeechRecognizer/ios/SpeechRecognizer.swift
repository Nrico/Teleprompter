import Foundation
import Capacitor
import Speech
import AVFoundation

@objc(SpeechRecognizer)
public class SpeechRecognizer: CAPPlugin {
    private var recognitionTask: SFSpeechRecognitionTask?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private let audioEngine = AVAudioEngine()
    private let speechRecognizer = SFSpeechRecognizer()

    @objc func checkPermissions(_ call: CAPPluginCall) {
        let micStatus: String
        switch AVAudioSession.sharedInstance().recordPermission {
        case .granted:
            micStatus = "granted"
        case .denied:
            micStatus = "denied"
        case .undetermined:
            micStatus = "undetermined"
        default:
            micStatus = "unknown"
        }

        let speechStatus: String
        switch SFSpeechRecognizer.authorizationStatus() {
        case .authorized:
            speechStatus = "granted"
        case .denied:
            speechStatus = "denied"
        case .restricted, .notDetermined:
            speechStatus = "undetermined"
        @unknown default:
            speechStatus = "unknown"
        }

        call.resolve(["microphone": micStatus, "speech": speechStatus])
    }

    @objc func requestPermissions(_ call: CAPPluginCall) {
        var micStatus = "unknown"
        var speechStatus = "unknown"
        let group = DispatchGroup()

        group.enter()
        AVAudioSession.sharedInstance().requestRecordPermission { allowed in
            micStatus = allowed ? "granted" : "denied"
            group.leave()
        }

        group.enter()
        SFSpeechRecognizer.requestAuthorization { auth in
            switch auth {
            case .authorized:
                speechStatus = "granted"
            case .denied:
                speechStatus = "denied"
            case .restricted, .notDetermined:
                speechStatus = "undetermined"
            @unknown default:
                speechStatus = "unknown"
            }
            group.leave()
        }

        group.notify(queue: .main) {
            call.resolve(["microphone": micStatus, "speech": speechStatus])
        }
    }

    @objc func startRecognition(_ call: CAPPluginCall) {
        stopCurrentRecognition()
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: [.duckOthers])
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            call.reject("Audio session error")
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            call.reject("Could not create request")
            return
        }
        recognitionRequest.shouldReportPartialResults = true

        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            recognitionRequest.append(buffer)
        }

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            call.reject("Audio engine start error")
            return
        }

        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { result, error in
            if let result = result {
                let transcription = result.bestTranscription
                var words: [[String: Any]] = []
                for segment in transcription.segments {
                    words.append([
                        "word": segment.substring,
                        "start": segment.timestamp,
                        "duration": segment.duration
                    ])
                }
                self.notifyListeners("transcriptionUpdate", data: [
                    "text": transcription.formattedString,
                    "words": words
                ])
                if result.isFinal {
                    self.stopCurrentRecognition()
                }
            }
            if error != nil {
                self.stopCurrentRecognition()
            }
        }
        call.resolve()
    }

    @objc func stopRecognition(_ call: CAPPluginCall) {
        stopCurrentRecognition()
        call.resolve()
    }

    private func stopCurrentRecognition() {
        audioEngine.stop()
        if audioEngine.inputNode.numberOfInputs > 0 {
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        recognitionRequest = nil
        recognitionTask = nil
    }
}
