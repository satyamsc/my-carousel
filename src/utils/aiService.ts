import { StructuredContent } from './contentAnalyzer';

export interface AISlideContent {
  title: string;
  body: string;
  imageDescription?: string;
}

export interface AIGeneratedSlides {
  slides: AISlideContent[];
  totalSlides: number;
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class AIService {
  private async makeRequest(messages: Array<{ role: string; content: string }>) {
    // Check if API key is configured
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      throw new Error('OpenRouter API key is not configured. Please add your API key to the .env file.');
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Text to Carousel Generator',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter API key in the .env file.');
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI content. Please try again.');
    }
  }

  async generateSlideContent(inputText: string, maxSlides: number = 10): Promise<AIGeneratedSlides> {
    const prompt = `You are an expert content creator specializing in creating engaging slide presentations. 

Analyze the following text and create a structured slide presentation:

"${inputText}"

Requirements:
- Create exactly ${maxSlides} slides (no more, no less)
- Each header must be concise and engaging (maximum 6 words, max 60 characters)
- Each slide body should contain 2-3 clear sentences (max 120 characters total)
- Start each sentence in the body with a relevant emoji/icon when it enhances understanding
- Focus on key points, insights, or actionable takeaways
- Make content engaging and easy to read
- Ensure logical flow between slides
- Use emojis and engaging language in headers when appropriate
- If the input text is short, expand on the concepts to create the required number of slides

Header Guidelines:
- Keep headers short and punchy (6 words maximum)
- Use action words and engaging language
- Include emojis when they add value

Body Guidelines:
- Start each sentence with a contextually relevant emoji when appropriate
- Put each sentence on a separate line for better readability
- Use emojis that enhance meaning and visual appeal
- Choose emojis that relate to the content (🚀 for growth, 💡 for ideas, 📊 for data, etc.)
- CRITICAL: Each sentence MUST start on a new line - use line breaks between sentences
- Ensure proper spacing between statements for enhanced readability

Examples of good headers:
✅ "AI Tools Transform Business"
✅ "Data Drives Smart Decisions"
✅ "Innovation Sparks Growth"
✅ "🚀 Future Tech Trends"

Format each slide exactly like this example:
Header: "🤖 AI Transforms Business Operations"
Body: "🎯 The art of asking AI the right way maximizes results.
✨ This ensures you get the smartest answer possible.
🚀 Modern businesses leverage AI for efficiency."

IMPORTANT FORMATTING RULES:
- Each sentence in the body MUST be on its own line
- Use actual line breaks (newlines) between sentences
- Do NOT use periods at the end of sentences followed by spaces on the same line
- Each emoji-prefixed statement should be a complete thought on its own line

Separate each slide with "---" on its own line.

Important: Follow the exact format above. Start each slide with "Header:" followed by a concise title, then "Body:" followed by 2-3 sentences with relevant emojis when appropriate. Put each sentence on its own line for better readability.`;

    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    try {
      const response = await this.makeRequest(messages);
      
      // Parse the Header/Body format response
      const slides: AISlideContent[] = [];
      
      // Split by slide separators
      const slideTexts = response.split(/---\s*\n?/).filter((text: string) => text.trim());
      
      for (const slideText of slideTexts) {
        const trimmedText = slideText.trim();
        if (!trimmedText) continue;
        
        // Extract Header and Body using regex that handles multi-line content
        const headerMatch = trimmedText.match(/Header:\s*[""']?(.*?)[""']?\s*\n/i);
        const bodyMatch = trimmedText.match(/Body:\s*[""']?([\s\S]*?)(?=\n\n|\n---|\n$|$)/i);
        
        if (headerMatch || bodyMatch) {
          slides.push({
            title: headerMatch?.[1]?.trim() || `Slide ${slides.length + 1}`,
            body: bodyMatch?.[1]?.trim() || '',
            imageDescription: undefined,
          });
        }
      }
      
      // If no slides were parsed with the separator method, try parsing as one block
      if (slides.length === 0) {
        const headerMatch = response.match(/Header:\s*[""']?(.*?)[""']?\s*\n/i);
        const bodyMatch = response.match(/Body:\s*[""']?([\s\S]*?)(?=\n\n|\n---|\n$|$)/i);
        
        if (headerMatch || bodyMatch) {
          slides.push({
            title: headerMatch?.[1]?.trim() || 'Generated Slide',
            body: bodyMatch?.[1]?.trim() || '',
            imageDescription: undefined,
          });
        }
      }
      
      if (slides.length === 0) {
        throw new Error('No valid slides found in response');
      }
      
      return {
        slides,
        totalSlides: slides.length,
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  async enhanceContent(content: StructuredContent): Promise<StructuredContent> {
    const prompt = `Enhance the following slide content to make it more engaging and professional:

Title: ${content.title || 'No title'}
Body: ${content.body || 'No body'}
Visual: ${content.visual || 'No visual'}

Requirements:
- Improve the title to be more engaging (max 60 characters)
- Enhance the body text to be more compelling (max 120 characters)
- Suggest a better visual description if needed
- Maintain the core message and meaning
- Make it suitable for a professional slide presentation

Return your response as a valid JSON object with this structure:
{
  "title": "Enhanced title",
  "body": "Enhanced body text",
  "visual": "Enhanced visual description"
}

Important: Return ONLY the JSON object, no additional text.`;

    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    try {
      const response = await this.makeRequest(messages);
      
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      return {
        ...content,
        title: parsed.title || content.title,
        body: parsed.body || content.body,
        visual: parsed.visual || content.visual,
      };
    } catch (error) {
      console.error('Error enhancing content:', error);
      // Return original content if enhancement fails
      return content;
    }
  }
}

export const aiService = new AIService();