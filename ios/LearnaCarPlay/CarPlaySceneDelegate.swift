//
//  CarPlaySceneDelegate.swift
//  LearnaCarPlay
//
//  Created for Learna AI English Tutor Onboarding Quiz
//  Complies with Apple CarPlay Human Interface Guidelines & CPTemplate framework.
//

import Foundation
import CarPlay

class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    
    var interfaceController: CPInterfaceController?
    var quizManager = CarPlayQuizManager.shared
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                didConnect interfaceController: CPInterfaceController) {
        self.interfaceController = interfaceController
        self.quizManager.interfaceController = interfaceController
        
        // Show initial Quiz Welcome / Question Template on the car screen
        let rootTemplate = quizManager.createRootTemplate()
        interfaceController.setRootTemplate(rootTemplate, animated: true, completion: nil)
        
        // Start voice prompt through car speakers
        quizManager.speakCurrentQuestion()
    }
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                didDisconnectInterfaceController interfaceController: CPInterfaceController) {
        self.interfaceController = nil
        self.quizManager.stopAudio()
    }
}

