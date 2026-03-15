# Local AI Toy (No API Key)

A tiny offline Naive Bayes text classifier written in plain Node.js.
It trains on a tiny dataset and classifies a few sample sentences.

## Run

```bash
node index.js
```

## What you'll see

Example output:

```
"free prize money now" => spam
"can we move the meeting to monday" => ham
"urgent: verify your account" => spam
"here is the agenda for tomorrow" => ham
```

## Why this is "AI"

Naive Bayes is a classic probabilistic machine learning model.
Here we implement training and inference from scratch without any libraries.
