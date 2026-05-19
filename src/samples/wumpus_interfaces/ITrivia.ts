export interface ITrivia {
    /**
    * asks up to maxNumberOfQuestionsToAsk. 
    * Returns an object containing: 
    *  isCorrect=true, if the numberOfCorrectAnswersNeeded questions were answered correctly.
    *  numberOfQuestionsAsked, this can be less than maxNumberOfQuestionsToAsk when the user didn't need all maxNumberOfQuestionsToAsk to reach numberOfCorrectAnswersNeeded
    */
    askQuestions(
        maxNumberOfQuestionsToAsk: number,
        numberOfCorrectAnswersNeeded: number): { isCorrect: boolean, numberOfQuestionsAsked: number };

}