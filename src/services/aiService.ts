// src/services/aiService.ts

/**
 * AI Service for generating article summaries using Colab-hosted model
 * 
 * Setup Instructions:
 * 1. Run your model on Google Colab
 * 2. Expose it via ngrok (see example below)
 * 3. Update COLAB_API_URL with your ngrok URL
 */

// TODO: Replace with your actual ngrok URL from Colab
// Example: 'https://xxxx-xx-xxx-xxx-xx.ngrok-free.app'
const COLAB_API_URL = 'https://pawnable-martina-epistemically.ngrok-free.dev';

/**
 * Generate AI summary from article content
 * @param content - Article content (can include HTML tags)
 * @param maxLength - Maximum length of summary (default: 256)
 * @param minLength - Minimum length of summary (default: 50)
 * @returns Promise<string> - Generated summary text
 */
export const generateAISummary = async (
    content: string,
    maxLength: number = 2048,
    minLength: number = 50
): Promise<string> => {
    try {
        // Validate input
        if (!content || content.trim().length === 0) {
            throw new Error('Content cannot be empty');
        }

        // Strip HTML tags to get plain text
        const plainText = content.replace(/<[^>]*>/g, ' ').trim();

        console.log('Generating AI summary for text length:', plainText.length);

        // Call Colab API with correct JSON format
        const response = await fetch(`${COLAB_API_URL}/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: plainText,
                max_length: maxLength,
                min_length: minLength,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.summary) {
            throw new Error('No summary returned from API');
        }

        console.log('AI summary generated successfully');
        return data.summary;

    } catch (error: any) {
        console.error('Error generating AI summary:', error);

        // Provide user-friendly error messages
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - Model took too long to respond');
        } else if (error.message.includes('Network request failed')) {
            throw new Error('Network error - Check your internet connection');
        } else if (error.message.includes('configure COLAB_API_URL')) {
            throw error; // Pass through configuration error
        } else {
            throw new Error('Failed to generate summary: ' + error.message);
        }
    }
};

/**
 * Check if AI service is configured and available
 * @returns Promise<boolean>
 */
export const checkAIServiceAvailability = async (): Promise<boolean> => {
    try {
        if (!COLAB_API_URL || COLAB_API_URL.includes('your-ngrok-url')) {
            return false;
        }

        const response = await fetch(`${COLAB_API_URL}/health`, {
            method: 'GET',
        });

        return response.ok;
    } catch (error) {
        console.error('AI service not available:', error);
        return false;
    }
};

/**
 * Get AI-powered article recommendations based on category
 * @param category - Category name to get recommendations for (e.g., "technology", "sports")
 * @param topK - Number of recommendations to return (default: 5)
 * @returns Promise<string[]> - Array of recommended article IDs
 */
export const getRecommendations = async (
    category: string,
    topK: number = 5
): Promise<string[]> => {
    try {
        console.log(`AI Service: Requesting recommendations for category="${category}", topK=${topK}`);
        
        // Validate input
        if (!category || typeof category !== 'string') {
            throw new Error('Category must be a non-empty string');
        }

        const url = `${COLAB_API_URL}/recommend`;
        console.log(`AI Service: Fetching from URL: ${url}`);

        // Check if API URL is configured
        if (!COLAB_API_URL || typeof COLAB_API_URL !== 'string' || COLAB_API_URL.includes('your-ngrok-url')) {
            throw new Error('Please configure COLAB_API_URL with your ngrok URL');
        }

        // Call Colab recommendation API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query_text: category,
                top_k: topK,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("AI Service: Received data:", data);

        if (!data.recommendations || !Array.isArray(data.recommendations)) {
            throw new Error('Invalid response format: "recommendations" array not found');
        }

        return data.recommendations;

    } catch (error: any) {
        console.error('AI Service: Error in getRecommendations:', error);

        // Provide user-friendly error messages
        if (error.message.includes('Network request failed')) {
            throw new Error('Network error - Check your internet connection');
        } else if (error.message.includes('configure COLAB_API_URL')) {
            throw error;
        } else {
            throw new Error('Failed to get recommendations: ' + error.message);
        }
    }
};

/**
 * Example Colab setup code:
 * 
 * ```python
 * from flask import Flask, request, jsonify
 * from pyngrok import ngrok
 * import threading
 * 
 * app = Flask(__name__)
 * 
 * @app.route('/summarize', methods=['POST'])
 * def summarize():
 *     data = request.json
 *     text = data.get('text', '')
 *     max_length = data.get('max_length', 256)
 *     min_length = data.get('min_length', 50)
 *     
 *     # Call your summarization model
 *     summary = your_summary_model.generate(text, max_length=max_length, min_length=min_length)
 *     
 *     return jsonify({'summary': summary})
 * 
 * @app.route('/recommend', methods=['POST'])
 * def recommend():
 *     data = request.json
 *     query_text = data.get('query_text', '')
 *     top_k = data.get('top_k', 5)
 *     
 *     # Call your recommendation model
 *     recommendations = your_recommendation_model.predict(query_text, top_k=top_k)
 *     
 *     return jsonify({'recommendations': recommendations})
 * 
 * @app.route('/health', methods=['GET'])
 * def health():
 *     return jsonify({'status': 'ok'})
 * 
 * # Run Flask in background
 * def run_flask():
 *     app.run(port=5000)
 * 
 * threading.Thread(target=run_flask, daemon=True).start()
 * 
 * # Expose via ngrok
 * public_url = ngrok.connect(5000)
 * print(f"🚀 Public URL: {public_url}")
 * ```
 */
