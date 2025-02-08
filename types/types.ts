
export interface MyRequest {
    id: number,
    context: string[]
    text: string
}

export interface MyResponse {
    id: number,
    buffer:  Buffer
}

export interface AnalysisResponse {
    analysis: {
    [key: string]: {
        id: string;
        question: string;
        answer: string;
        feedback: {
        general: string;
        strengths: string;
        suggestions: string[];
        };
    };
    };
}

