import type { QuizQuestion, QuizAnswer } from "@shared/schema";

export interface ScoringResult {
  score: number; // percentage
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  detailedResults: Array<{
    questionId: number;
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
  }>;
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  passingScore: number = 70
): ScoringResult {
  const answerMap = new Map(answers.map(a => [a.questionId, a]));
  const detailedResults = [];
  let totalPoints = 0;
  let earnedPoints = 0;
  let correctCount = 0;

  for (const question of questions) {
    const userAnswer = answerMap.get(question.id);
    const maxPoints = question.points || 1;
    totalPoints += maxPoints;

    let isCorrect = false;
    let pointsEarned = 0;

    if (userAnswer && userAnswer.answer !== null && userAnswer.answer !== undefined) {
      isCorrect = evaluateAnswer(question, userAnswer.answer);
      if (isCorrect) {
        pointsEarned = maxPoints;
        correctCount++;
      }
    }

    earnedPoints += pointsEarned;
    detailedResults.push({
      questionId: question.id,
      isCorrect,
      pointsEarned,
      maxPoints,
    });
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= passingScore;

  return {
    score,
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    passed,
    detailedResults,
  };
}

function evaluateAnswer(question: QuizQuestion, userAnswer: any): boolean {
  switch (question.type) {
    case 'multiple-choice':
      return userAnswer === question.correctAnswer;

    case 'true-false':
      return userAnswer === question.correctAnswer;

    case 'fill-blank':
      if (typeof userAnswer !== 'string') return false;
      const answer = question.caseSensitive ? userAnswer : userAnswer.toLowerCase();
      return question.correctAnswers.some(correct => {
        const correctAnswer = question.caseSensitive ? correct : correct.toLowerCase();
        return answer.trim() === correctAnswer.trim();
      });

    case 'matching':
      if (typeof userAnswer !== 'string') return false;
      try {
        // Parse format like "1-A, 2-B, 3-C"
        const userMatches: Record<number, number> = {};
        const pairs = userAnswer.split(',').map(p => p.trim());
        
        for (const pair of pairs) {
          const [left, right] = pair.split('-').map(p => p.trim());
          if (left && right) {
            const leftIndex = parseInt(left) - 1; // Convert 1-based to 0-based
            const rightIndex = right.charCodeAt(0) - 65; // Convert A-Z to 0-based
            if (!isNaN(leftIndex) && rightIndex >= 0) {
              userMatches[leftIndex] = rightIndex;
            }
          }
        }

        // Check if all matches are correct
        for (const [leftIdx, rightIdx] of Object.entries(question.correctMatches)) {
          if (userMatches[parseInt(leftIdx)] !== rightIdx) {
            return false;
          }
        }
        return Object.keys(userMatches).length === Object.keys(question.correctMatches).length;
      } catch {
        return false;
      }

    case 'essay':
      // Essay questions require manual grading
      // For now, return true if there's content (will need manual review)
      return typeof userAnswer === 'string' && userAnswer.trim().length > 0;

    default:
      return false;
  }
}