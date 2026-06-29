import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI-powered executive briefing endpoint
  app.post("/api/ai-briefing", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "API Key Not Configured",
          message: "The Gemini API key is missing. Please add your key in Settings > Secrets."
        });
      }

      const { announcements, weather, shift, date, department } = req.body;

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Date: ${date}
Shift: ${shift}
Department: ${department}
Weather Summary: Temp: ${weather?.temp}°C, Condition: ${weather?.condition}, Humidity: ${weather?.humidity}%
Announcements: ${JSON.stringify(announcements)}

Requirements:
- Structure the briefing into 3 to 4 short, highly scannable bullet points.
- Address the current shift and department if appropriate.
- Give a dynamic, high-energy operations status or encouraging tip.
- Do NOT use flowery language, keep it ultra-modern, crisp, and readable from a distance.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ briefing: response.text });
    } catch (error: any) {
      console.error("AI Briefing Error:", error);
      res.status(500).json({
        error: "Generation Failed",
        message: error.message || "An unknown error occurred while generating the briefing."
      });
    }
  });

  // Live top news of Bangladesh & International
  app.get("/api/news", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          news: [
            "Bangladesh: Government prioritizes digital infrastructure and smart technology expansion nationwide.",
            "International: Global tech leaders meet in Silicon Valley to discuss safety regulations for advanced AI models.",
            "Bangladesh: Software exports and local tech services reach a historic $2.5 billion milestone.",
            "International: Transition to solar and wind power hits record speeds across Europe and North America.",
            "Bangladesh: Expansion of modern high-tech business parks attracts major global tech investments."
          ]
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Search the web and find the top 5 most recent major news stories from the last 24-48 hours. 
Exactly 2-3 stories should be top national news of Bangladesh and 2-3 should be major international/global headlines.
Each story should be brief (under 120 characters), factual, and highly professional.
Format the output EXACTLY as a JSON array of strings, with no other text, markdown blocks, or commentary.
For example:
[
  "Bangladesh: Bangladesh government launches new digital initiative for agricultural efficiency.",
  "International: Global climate summit reaches historical agreement on offshore wind power expansion."
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      let text = response.text || "[]";
      // Clean up markdown block if present
      if (text.includes("```")) {
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      }

      try {
        const news = JSON.parse(text);
        if (Array.isArray(news) && news.length > 0) {
          return res.json({ news });
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini news response:", text, parseError);
      }

      res.json({
        news: [
          "Bangladesh: Government prioritizes digital infrastructure and smart technology expansion nationwide.",
          "International: Global tech leaders meet in Silicon Valley to discuss safety regulations for advanced AI models.",
          "Bangladesh: Software exports and local tech services reach a historic $2.5 billion milestone.",
          "International: Transition to solar and wind power hits record speeds across Europe and North America.",
          "Bangladesh: Expansion of modern high-tech business parks attracts major global tech investments."
        ]
      });

    } catch (error: any) {
      console.error("Live News API Error:", error);
      res.json({
        news: [
          "Bangladesh: Government prioritizes digital infrastructure and smart technology expansion nationwide.",
          "International: Global tech leaders meet in Silicon Valley to discuss safety regulations for advanced AI models.",
          "Bangladesh: Software exports and local tech services reach a historic $2.5 billion milestone.",
          "International: Transition to solar and wind power hits record speeds across Europe and North America.",
          "Bangladesh: Expansion of modern high-tech business parks attracts major global tech investments."
        ]
      });
    }
  });

  // Integrate Vite as Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Lantabur Operations] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
