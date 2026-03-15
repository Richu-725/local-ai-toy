// Tiny offline AI demo: Naive Bayes text classifier (no external deps)
// Train on a tiny dataset and classify new inputs.

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
  // Prior with Laplace smoothing
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

const readline = await import("node:readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Offline Naive Bayes demo. Type a sentence to classify.");
console.log("Type /exit to quit.");

const ask = () => {
  rl.question("> ", (line) => {
    const text = line.trim();
    if (!text) return ask();
    if (text === "/exit") {
      rl.close();
      return;
    }
    console.log(`${JSON.stringify(text)} => ${classify(text)}`);
    ask();
  });
};

ask();
