const { GoogleGenerativeAI } = require("@google/generative-ai");
const Analysis = require('../models/Analysis.js');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeImage = async (req, res) => {
  try {
    const { image, location, timeOfDay } = req.body;
    
    if (!image) return res.status(400).json({ error: "No image provided" });

    const base64Data = image.includes(',') ? image.split(",")[1] : image;
    const mimeType = image.includes(',') ? image.split(";")[0].split(":")[1] : 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

    const prompt = `You are a professional photography analyst. Analyze this photograph and provide detailed insights.

Context:
- Location: ${location || 'Not specified'}
- Time of Day: ${timeOfDay || 'Not specified'}

CRITICAL: Return ONLY a valid JSON object. No markdown, no code blocks, no additional text. Just pure JSON.

Required JSON structure:
{
  "light_analysis": {
    "score": <number 0-100>,
    "direction": "<detailed description of light direction>",
    "quality": "<soft/harsh/diffused/etc>",
    "color_temperature": "<warm/neutral/cool with approx Kelvin>",
    "time_of_day_indicator": "<golden hour/blue hour/midday/etc>",
    "shadows": "<detailed shadow characteristics>"
  },
  "color_analysis": {
    "score": <number 0-100>,
    "dominant_colors": ["<color1>", "<color2>", "<color3>"],
    "mood": "<warm/cool/vibrant/muted/serene/etc>",
    "harmony": "<analogous/complementary/triadic/monochromatic/etc>",
    "palette_description": "<detailed color palette description>"
  },
  "emotion_analysis": {
    "score": <number 0-100>,
    "primary_emotion": "<main emotion conveyed>",
    "intensity": "<low/medium/high>",
    "mood": "<overall mood description>",
    "storytelling": "<narrative and storytelling quality>"
  },
  "composition_analysis": {
    "score": <number 0-100>,
    "rules_applied": ["<rule1>", "<rule2>", "<rule3>"],
    "focal_points": ["<focal point 1>", "<focal point 2>"],
    "balance": "<symmetrical/asymmetrical/dynamic/etc>",
    "negative_space": "<effective use description>",
    "depth": "<depth perception description>"
  },
  "reshoot_suggestions": {
    "best_time": "<optimal time of day>",
    "weather_conditions": "<ideal weather>",
    "alternative_angles": ["<angle1>", "<angle2>", "<angle3>"]
  },
  "lens_recommendations": [
    "<lens recommendation 1 with focal length>",
    "<lens recommendation 2 with focal length>",
    "<lens recommendation 3 with focal length>"
  ],
  "caption_ideas": [
    "<creative caption 1>",
    "<creative caption 2>",
    "<creative caption 3>"
  ]
}

Analyze the photo professionally and return ONLY the JSON.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: mimeType } }
    ]);

    const text = (await result.response).text();
    let jsonString = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const analysisResults = JSON.parse(jsonString);

    // Save to DB
    const newEntry = new Analysis({ 
      imageBase64: image, 
      location: location || '', 
      timeOfDay: timeOfDay || '', 
      results: analysisResults 
    });
    await newEntry.save();

    res.json(analysisResults);
  } catch (error) {
    console.error("❌ Controller Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAnalyses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const analyses = await Analysis.find().sort({ createdAt: -1 }).limit(limit).select('-imageBase64');
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};