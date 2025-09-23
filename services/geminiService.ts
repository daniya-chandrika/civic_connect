import { GoogleGenAI } from "@google/genai";
import { Category } from '../types';
import { DEPARTMENTS, CATEGORY_TO_DEPARTMENT_MAP } from '../constants';


// Lazily initialize the client to prevent app crash on load if process.env is not ready.
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (!aiClient) {
        // According to guidelines, API_KEY is assumed to be available in process.env
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            // This will be caught by the calling functions and shown to the user.
            throw new Error("API_KEY is not configured in the environment.");
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
};


const ANALYSIS_TIMEOUT = 15000; // 15 seconds

export class GeminiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GeminiError';
    }
}

export const categorizeImage = async (base64ImageData: string, mimeType: string): Promise<Category> => {
    try {
        const ai = getAiClient();
        const model = 'gemini-2.5-flash';
        
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };

        const validCategories = Object.values(Category).join(', ');
        const textPart = {
            text: `Analyze the image. First, determine if it shows a real-world civic issue like a pothole, broken streetlight, graffiti, etc. If it does not, respond with only the word "UNRECOGNIZED". If it does show a civic issue, categorize it into one of the following exact categories: ${validCategories}. Respond with only the category name, nothing else. For example: Pothole`,
        };

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new GeminiError('Timeout')), ANALYSIS_TIMEOUT)
        );

        const apiCall = ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
        });

        const response = await Promise.race([apiCall, timeoutPromise]);

        const categoryText = response.text.trim();
        
        if (categoryText === 'UNRECOGNIZED') {
            throw new GeminiError('UnrecognizedImage');
        }
        
        if (Object.values(Category).includes(categoryText as Category)) {
            return categoryText as Category;
        } else {
            console.warn(`Gemini returned an invalid category: "${categoryText}". Defaulting to 'Other'.`);
            return Category.OTHER;
        }
    } catch (error) {
        if (error instanceof GeminiError) {
           throw error; // Re-throw custom errors to be handled by the UI
        }
        console.error("Error calling Gemini API for categorization:", error);
        // Generic error for unexpected API failures
        throw new Error("Could not analyze the image due to an API error.");
    }
};

export const generateSummary = async (description: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    
    const prompt = `Summarize the following issue description in one short sentence for a city official. Be concise and focus on the core problem.\n\nDescription: "${description}"\n\nSummary:`;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for summary:", error);
        return "Could not generate summary due to an error.";
    }
};

export const assignDepartment = async (title: string, description: string, category: Category): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const validDepartments = DEPARTMENTS.join(', ');
    const prompt = `Based on the issue title, description, and category, assign the most appropriate department from the following list: ${validDepartments}. Respond with only the department name, nothing else.\n\nTitle: "${title}"\nDescription: "${description}"\nCategory: "${category}"\n\nAssigned Department:`;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        const departmentText = response.text.trim();
        
        if (DEPARTMENTS.includes(departmentText)) {
            return departmentText;
        } else {
            console.warn(`Gemini returned an invalid department: "${departmentText}". Falling back to category map.`);
            return CATEGORY_TO_DEPARTMENT_MAP[category] || DEPARTMENTS[0];
        }
    } catch (error) {
        console.error("Error calling Gemini API for department assignment:", error);
        // Fallback to category map in case of an API error
        return CATEGORY_TO_DEPARTMENT_MAP[category] || DEPARTMENTS[0];
    }
};