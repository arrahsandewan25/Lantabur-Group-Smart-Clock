import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // In-memory cache for live news to handle rate limits and resource exhaustion gracefully
  let cachedNews: string[] | null = null;
  let cachedNewsTime = 0;
  const NEWS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

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

  // Live top news using Gemini API Search Grounding
  app.get("/api/news", async (req, res) => {
    const FALLBACK_NEWS = [
      "Politics: Bangladesh strengthens bilateral ties with international trade partners for smart infrastructure development.",
      "Garments: Bangladesh apparel exports show strong resilience with rising number of green certified factories.",
      "Economics: Global inflation levels stabilize as economic policy shifts support manufacturing sectors.",
      "Tech Giants: Leading tech companies launch advanced AI models designed for robust agentic workflows.",
      "Politics: Government accelerates high-tech park expansions to boost digital innovation across divisional zones.",
      "Economics: International trade and shipping routes recover, improving export-import cargo transit times."
    ];

    try {
      const now = Date.now();
      // Cache news for 10 minutes to maintain performance and avoid API rate limits
      if (cachedNews && (now - cachedNewsTime < 10 * 60 * 1000)) {
        return res.json({ news: cachedNews });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        console.warn("Gemini API key is not configured for search grounded live news feed. Using fallback.");
        return res.json({ news: FALLBACK_NEWS });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Retrieve the absolute latest real-time news from today about Bangladesh, Saudi Arabia/UAE, and global technology or business. Generate 8-10 short, crisp, single-sentence live news updates (under 20 words each). Each update must start with a category followed by a colon, for example: 'Bangladesh: [Update]', 'Saudi Arabia: [Update]', 'Technology: [Update]', or 'Global: [Update]'. Make sure they represent real news events from the last 24 hours.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const newsArray = JSON.parse(text);
        if (Array.isArray(newsArray) && newsArray.length > 0) {
          cachedNews = newsArray;
          cachedNewsTime = now;
          return res.json({ news: cachedNews });
        }
      }

      throw new Error("Invalid response format from Gemini search grounded news");
    } catch (error: any) {
      console.warn("Soft warning: Gemini Search News API request failed. Serving cached/fallback news content.", error);
      if (cachedNews && cachedNews.length > 0) {
        return res.json({ news: cachedNews });
      }
      return res.json({ news: FALLBACK_NEWS });
    }
  });

  // Google Calendar Integration
  app.get("/api/calendar", async (req, res) => {
    try {
      const oauthToken = req.headers["x-goog-oauth-token"];
      if (!oauthToken) {
        return res.json({
          authenticated: false,
          error: "Google Calendar token not found in headers."
        });
      }

      const timeMin = new Date().toISOString();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      const timeMax = threeMonthsLater.toISOString();

      const fetchCalendarEvents = async (calendarId: string) => {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=20`;
        try {
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${oauthToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            return data.items || [];
          } else {
            console.error(`Google Calendar API response error for ${calendarId}:`, response.status, response.statusText);
          }
        } catch (e) {
          console.error(`Error calling Google Calendar API for ${calendarId}:`, e);
        }
        return [];
      };

      const [primaryItems, bdHolidayItems] = await Promise.all([
        fetchCalendarEvents("primary"),
        fetchCalendarEvents("en.bd#holiday@group.v.calendar.google.com")
      ]);

      const allItems = [...primaryItems, ...bdHolidayItems];
      const seen = new Set<string>();
      const googleEvents = [];

      for (const evt of allItems) {
        const dateStr = evt.start?.date || evt.start?.dateTime?.split("T")[0] || new Date().toISOString().split("T")[0];
        const title = evt.summary || "Untitled Event";
        const key = `${title}_${dateStr}`;
        if (seen.has(key)) continue;
        seen.add(key);

        let type = "public";
        const titleLower = title.toLowerCase();
        if (titleLower.includes("school") || titleLower.includes("class") || titleLower.includes("exam")) {
          type = "school";
        } else if (titleLower.includes("meeting") || titleLower.includes("work") || titleLower.includes("company") || titleLower.includes("audit") || titleLower.includes("corporate") || titleLower.includes("payroll")) {
          type = "company";
        }

        googleEvents.push({
          id: evt.id || Math.random().toString(36).substring(2, 9),
          title: title,
          date: dateStr,
          type: type
        });
      }

      googleEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json({
        authenticated: true,
        events: googleEvents.slice(0, 20)
      });
    } catch (error: any) {
      console.error("Google Calendar API route error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message
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
