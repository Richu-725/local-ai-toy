const textEl = document.getElementById("text");
const btn = document.getElementById("btn");
const resultEl = document.getElementById("result");
const statusEl = document.getElementById("status");

async function classify() {
  const text = textEl.value.trim();
  if (!text) {
    resultEl.textContent = "Please type a sentence.";
    return;
  }
  statusEl.textContent = "Classifying...";
  resultEl.textContent = "";
  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    resultEl.textContent = `Label: ${data.label}`;
  } catch (err) {
    resultEl.textContent = `Error: ${err.message}`;
  } finally {
    statusEl.textContent = "";
  }
}

btn.addEventListener("click", classify);
textEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") classify();
});

for (const chip of document.querySelectorAll(".chip")) {
  chip.addEventListener("click", () => {
    textEl.value = chip.textContent;
    textEl.focus();
  });
}
