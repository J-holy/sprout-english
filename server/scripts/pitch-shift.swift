// 소리 높이 올리기 (macOS AVAudioUnitTimePitch, 길이는 그대로): 여러 파일을 한 번에 처리한다
//   swiftc -O pitch-shift.swift -o pitch-shift   (pregen-tts-ko.js가 처음 한 번 만들어 둔다)
//   ./pitch-shift 300 in1.wav out1.wav [in2.wav out2.wav …]   센트 단위(100센트 = 반음). 결과는 16비트 WAV
// 2026-11-28: 수학 목소리 Zephyr를 +300센트(3반음) 올려 쓰기로 함. 처음 스크립트는 다른 세션의 scratchpad/pitch.swift
import AVFoundation

let a = CommandLine.arguments
guard a.count >= 4, let cents = Float(a[1]), (a.count - 2) % 2 == 0 else {
  FileHandle.standardError.write("사용: pitch-shift 센트 in.wav out.wav [in out …]\n".data(using: .utf8)!); exit(2)
}
var failed = 0
for i in stride(from: 2, to: a.count, by: 2) {
  do {
    let file = try AVAudioFile(forReading: URL(fileURLWithPath: a[i])), fmt = file.processingFormat
    let eng = AVAudioEngine(), player = AVAudioPlayerNode(), tp = AVAudioUnitTimePitch()
    tp.pitch = cents
    eng.attach(player); eng.attach(tp)
    eng.connect(player, to: tp, format: fmt); eng.connect(tp, to: eng.mainMixerNode, format: fmt)
    try eng.enableManualRenderingMode(.offline, format: fmt, maximumFrameCount: 4096)
    try eng.start(); player.scheduleFile(file, at: nil); player.play()
    // 16비트 정수 WAV로 쓴다 (node에서 바로 읽게)
    let settings: [String: Any] = [AVFormatIDKey: kAudioFormatLinearPCM, AVSampleRateKey: fmt.sampleRate, AVNumberOfChannelsKey: fmt.channelCount,
                                   AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: false, AVLinearPCMIsBigEndianKey: false]
    let out = try AVAudioFile(forWriting: URL(fileURLWithPath: a[i + 1]), settings: settings, commonFormat: fmt.commonFormat, interleaved: fmt.isInterleaved)
    let buf = AVAudioPCMBuffer(pcmFormat: eng.manualRenderingFormat, frameCapacity: eng.manualRenderingMaximumFrameCount)!
    var left = file.length + Int64(fmt.sampleRate / 5) // 처리 지연만큼 0.2초 더
    while left > 0 {
      let n = AVAudioFrameCount(min(Int64(buf.frameCapacity), left))
      if try eng.renderOffline(n, to: buf) == .success { try out.write(from: buf); left -= Int64(buf.frameLength) } else { break }
    }
    eng.stop()
  } catch { failed += 1; FileHandle.standardError.write("실패 \(a[i]): \(error)\n".data(using: .utf8)!) }
}
exit(failed > 0 ? 1 : 0)
