import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeHTML, wrapHTML, validateHTML } from "../utils/htmlUtils.js";
import { sendSuccess, sendError, sendValidationError } from "../utils/responseUtils.js";
import { GEMINI_CONFIG, SYSTEM_PROMPT, LIMITS } from "../config/constants.js";
import dotenv from "dotenv";


dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate landing page HTML using Gemini AI
 * @param {string} prompt - User prompt for generation
 * @returns {Promise<string>} Generated HTML
 */
const generateLandingPageHTML = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });

  const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Prompt: ${prompt}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const rawHTML = response.text();
    const cleanedHTML = sanitizeHTML(rawHTML);
    const finalHTML = wrapHTML(cleanedHTML);
    
    // Validate the generated HTML
    const validation = validateHTML(finalHTML);
    if (!validation.isValid) {
      throw new Error(`Generated HTML validation failed: ${validation.error}`);
    }
    
    return finalHTML;
  } catch (error) {
    console.error("Error generating landing page:", error);
    throw new Error(`Failed to generate landing page: ${error.message}`);
  }
};

/**
 * Handle POST /api/generate request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export const generateLandingPage = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validation
    if (!prompt) {
      return sendValidationError(res, "Prompt is required");
    }

    if (typeof prompt !== 'string') {
      return sendValidationError(res, "Prompt must be a string");
    }

    if (prompt.length > LIMITS.MAX_PROMPT_LENGTH) {
      return sendValidationError(res, `Prompt exceeds maximum length of ${LIMITS.MAX_PROMPT_LENGTH} characters`);
    }

    if (prompt.trim().length < 10) {
      return sendValidationError(res, "Prompt must be at least 10 characters long");
    }

    console.log(`Generating landing page for prompt: "${prompt.substring(0, 100)}..."`);

    const generatedHTML = await generateLandingPageHTML(prompt);
    
    sendSuccess(res, { html: generatedHTML }, "Landing page generated successfully");
    
  } catch (error) {
    console.error("Error in generateLandingPage:", error);
    sendError(res, error.message, 500, error.stack);
  }
};