import type { AnalysisResponse } from "../../types/types";

export const transformInterviewJson = (input: string): AnalysisResponse => {
    // Remove markdown code block markers and any extra whitespace
    const cleanedInput = input
      .replace(/```json\n/, '') // Remove opening markdown
      .replace(/\n```$/, '')    // Remove closing markdown
      .trim();                  // Remove extra whitespace
  
    try {
      // Parse the cleaned string into a JSON object
      const parsed = JSON.parse(cleanedInput);
      
      // Transform the data into a more frontend-friendly format
      // Each question becomes an object with all its related information
      return parsed.reduce((acc: any, item: any) => {
        acc[item.question_id] = {
          id: item.question_id,
          question: item.question,
          answer: item.answer,
          feedback: {
            general: item.general_feedback,
            strengths: item.strengths,
            suggestions: item.suggestions
          }
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Failed to parse interview feedback');
    }
  };