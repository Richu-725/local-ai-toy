// Simple static server + JSON classify endpoint (no deps)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, "public");

const training = [
  { text: "buy cheap pills now", label: "spam" },
  { text: "limited time offer free money", label: "spam" },
  { text: "winner claim your prize", label: "spam" },
  { text: "urgent account verification required", label: "spam" },
  { text: "meeting at 3pm tomorrow", label: "ham" },
  { text: "lunch plans for friday", label: "ham" },
  { text: "can we reschedule the call", label: "ham" },
  { text: "here is the report draft", label: "ham" },
];

const tokenize = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const labels = ["spam", "ham"];
const counts = {
  spam: { total: 0, words: Object.create(null) },
  ham: { total: 0, words: Object.create(null) },
};
const docCounts = { spam: 0, ham: 0 };

for (const { text, label } of training) {
  docCounts[label] += 1;
  const tokens = tokenize(text);
  for (const t of tokens) {
    counts[label].total += 1;
    counts[label].words[t] = (counts[label].words[t] || 0) + 1;
  }
}

const vocab = new Set();
for (const label of labels) {
  for (const w of Object.keys(counts[label].words)) vocab.add(w);
}
const vocabSize = vocab.size;

function score(text, label) {
  const tokens = tokenize(text);
  const prior = Math.log((docCounts[label] + 1) / (training.length + labels.length));
  let logProb = prior;
  for (const t of tokens) {
    const wordCount = counts[label].words[t] || 0;
    const prob = (wordCount + 1) / (counts[label].total + vocabSize);
    logProb += Math.log(prob);
  }
  return logProb;
}

function classify(text) {
  const sSpam = score(text, "spam");
  const sHam = score(text, "ham");
  return sSpam > sHam ? "spam" : "ham";
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/classify") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { text } = JSON.parse(body || "{}");
          if (!text || typeof text !== "string") {
            res.writeHead(400, { "content-type": "application/json" });
            res.end(JSON.stringify({ error: "text is required" }));
            return;
          }
          const label = classify(text);
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ label }));
        } catch {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: "invalid json" }));
        }
      });
      return;
    }

    const urlPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = join(publicDir, urlPath);
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { "content-type": mime[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
