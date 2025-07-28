# SpeechRecognizer Capacitor Plugin

This directory contains an example Capacitor plugin written in Swift. The plugin provides real-time speech recognition using Apple's Speech framework.

## Plugin Methods

- `startRecognition()` – begin listening to the microphone and emit transcription results via the `transcriptionUpdate` event.
- `stopRecognition()` – stop any active speech recognition session.
- `checkPermissions()` – return the current microphone and speech recognition permission states.
- `requestPermissions()` – request any missing permissions.

## Events

`transcriptionUpdate` is fired with the following data:

```json
{
  "text": "full transcript",
  "words": [
    { "word": "Hello", "start": 0.12, "duration": 0.35 },
    { "word": "world", "start": 0.5, "duration": 0.4 }
  ]
}
```

The `words` array includes timing information for each recognized word.
