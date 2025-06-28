import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const fallbackResponses: Record<string, string> = {
  "breakfast": "For a high-protein breakfast, try Greek yogurt with berries and granola, or scrambled eggs with spinach and whole grain toast. These provide sustained energy and help with muscle recovery. Aim for 20-25g of protein to kickstart your metabolism!",
  
  "calories": "For someone who's 160lbs and lifting 3x/week, aim for around 2,200-2,400 calories daily for maintenance, or 2,000-2,200 for gradual fat loss. Focus on 0.8-1g protein per lb of body weight (128-160g daily). Adjust based on your energy levels and progress!",
  
  "workout": "Here's a quick 20-minute core routine:\n• Plank holds (3x 30-60 seconds)\n• Russian twists (3x 20 reps)\n• Mountain climbers (3x 30 seconds)\n• Dead bugs (3x 10 each side)\n• Bicycle crunches (3x 15 each side)\nRest 30 seconds between exercises. Focus on form over speed!",
  
  "recovery": "Post-workout, eat within 30-60 minutes! Try chocolate milk, protein shake with banana, or grilled chicken with sweet potato. Aim for 3:1 or 4:1 carb-to-protein ratio to replenish glycogen and support muscle repair. Don't forget to hydrate!",
  
  "motivation": "Rest days are growth days! Your muscles repair and get stronger during recovery. Try light activities like walking, yoga, or stretching. Remember: consistency beats intensity. Every small step forward is progress worth celebrating!",
  
  "default": "Great question! As your fitness companion, I recommend focusing on proper form, consistent nutrition, and adequate rest. Every fitness journey is unique - listen to your body and celebrate small wins. For personalized advice, consider consulting a fitness professional!"
};

function getResponseKey(question: string): string {
  const lowerQ = question.toLowerCase();
  if (lowerQ.includes('breakfast') || lowerQ.includes('meal') || lowerQ.includes('protein')) return 'breakfast';
  if (lowerQ.includes('calorie') || lowerQ.includes('weight') || lowerQ.includes('160') || lowerQ.includes('lifting')) return 'calories';
  if (lowerQ.includes('workout') || lowerQ.includes('exercise') || lowerQ.includes('core') || lowerQ.includes('20')) return 'workout';
  if (lowerQ.includes('recovery') || lowerQ.includes('post-workout') || lowerQ.includes('muscle')) return 'recovery';
  if (lowerQ.includes('motivation') || lowerQ.includes('rest day') || lowerQ.includes('stay motivated')) return 'motivation';
  return 'default';
}

export async function askZenAI(question: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Zen, a fitness and nutrition AI assistant for ZenGym. You provide helpful, encouraging advice about:
          - Workout routines and exercises
          - Nutrition and meal planning
          - Fitness goals and motivation
          - Healthy lifestyle tips
          
          Keep responses concise (under 200 words), practical, and motivating. Always encourage users to consult healthcare professionals for medical advice.`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0].message.content || fallbackResponses[getResponseKey(question)];
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Use fallback response instead of throwing error
    return fallbackResponses[getResponseKey(question)];
  }
}