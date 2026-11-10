//
//  CarPlayQuizManager.swift
//  LearnaCarPlay
//
//  Manages Hands-Free Voice Audio, CPTemplate screens, and Steering Wheel Controls
//

import Foundation
import CarPlay
import AVFoundation
import MediaPlayer

class CarPlayQuizManager: NSObject, AVSpeechSynthesizerDelegate {
    
    static let shared = CarPlayQuizManager()
    
    var interfaceController: CPInterfaceController?
    private let synthesizer = AVSpeechSynthesizer()
    private var currentStepIndex = 0
    private var answers: [String: Any] = [:]
    
    // Reverse-Engineered quiz steps from ailearna.com
    let steps: [(id: String, title: String, options: [String])] = [
        ("select_age", "How old are you?", ["18-24", "25-34", "35-44", "45+"]),
        ("select_language", "What is your native language?", ["Spanish", "English", "French", "German"]),
        ("select_proficiency", "What is your English level?", ["Beginner", "Pre-Intermediate", "Intermediate", "Upper-Intermediate", "Advanced", "Proficient"]),
        ("select_motivation", "Why do you want to learn English?", ["Work & Career", "Daily Conversations", "Travel Abroad", "Exams"]),
        ("select_goal", "What level of English do you aim to achieve?", ["Speak Confidently", "Watch Movies", "Understand Effortlessly"]),
        ("statement_understand_cant_speak", "I understand but can't speak fluently.", ["True", "Partially True", "Not True"]),
        ("statement_few_words", "I get stuck because I know too few words.", ["True", "Partially True", "Not True"]),
        ("select_improvement_area", "What area would you like to improve most?", ["Speaking", "Listening", "Vocabulary"]),
        ("personalized", "Your 30-Day Plan is Ready!", ["Start Free Practice"])
    ]
    
    override init() {
        super.init()
        synthesizer.delegate = self
        setupAudioSession()
        setupRemoteCommands()
    }
    
    private func setupAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
            try session.setActive(true)
        } catch {
            print("Failed to configure AVAudioSession: \(error)")
        }
    }
    
    // Support steering wheel remote controls (Next Track = Next Question, Prev Track = Repeat)
    private func setupRemoteCommands() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        commandCenter.nextTrackCommand.addTarget { [weak self] _ in
            self?.nextStep()
            return .success
        }
        
        commandCenter.previousTrackCommand.addTarget { [weak self] _ in
            self?.speakCurrentQuestion()
            return .success
        }
        
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.speakCurrentQuestion()
            return .success
        }
        
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.stopAudio()
            return .success
        }
    }
    
    func createRootTemplate() -> CPTemplate {
        return buildTemplateForCurrentStep()
    }
    
    func buildTemplateForCurrentStep() -> CPTemplate {
        guard currentStepIndex < steps.count else {
            return createCompletionTemplate()
        }
        
        let step = steps[currentStepIndex]
        var listItems: [CPListItem] = []
        
        for (index, opt) in step.options.enumerated() {
            let item = CPListItem(text: opt, detailText: "Tap or say Option \(index + 1)")
            item.handler = { [weak self] _, completion in
                self?.selectOption(opt)
                completion()
            }
            listItems.append(item)
        }
        
        let section = CPListSection(items: listItems)
        let listTemplate = CPListTemplate(title: "Step \(currentStepIndex + 1)/\(steps.count)", sections: [section])
        
        // Voice Action button on CarPlay top bar
        let voiceButton = CPBarButton(title: "🎙️ Speak") { [weak self] _ in
            self?.speakCurrentQuestion()
        }
        listTemplate.trailingNavigationBarButtons = [voiceButton]
        
        return listTemplate
    }
    
    func selectOption(_ value: String) {
        let step = steps[currentStepIndex]
        answers[step.id] = value
        nextStep()
    }
    
    func nextStep() {
        if currentStepIndex < steps.count - 1 {
            currentStepIndex += 1
            let newTemplate = buildTemplateForCurrentStep()
            interfaceController?.pushTemplate(newTemplate, animated: true, completion: nil)
            speakCurrentQuestion()
        }
    }
    
    func speakCurrentQuestion() {
        guard currentStepIndex < steps.count else { return }
        stopAudio()
        
        let step = steps[currentStepIndex]
        let text = "\(step.title). Options are: \(step.options.joined(separator: ", "))."
        
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate
        synthesizer.speak(utterance)
        
        // Update NowPlayingInfo for CarPlay dashboard
        updateNowPlaying(title: step.title)
    }
    
    func stopAudio() {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
    }
    
    private func updateNowPlaying(title: String) {
        var info = [String: Any]()
        info[MPMediaItemPropertyTitle] = title
        info[MPMediaItemPropertyArtist] = "Learna AI English Tutor"
        info[MPMediaItemPropertyAlbumTitle] = "Apple CarPlay Audio Quiz"
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }
    
    private func createCompletionTemplate() -> CPTemplate {
        let doneItem = CPListItem(text: "30-Day Fluency Plan Ready", detailText: "Start your daily 10-minute commute practice!")
        let section = CPListSection(items: [doneItem])
        return CPListTemplate(title: "🎉 Completed!", sections: [section])
    }
}

