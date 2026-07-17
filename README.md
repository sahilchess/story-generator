# Story Generator

a choose your own adventure engine where every story is generated live and your choices actually change what happens next.

## try it

https://story.sahild.hackclub.app


<img width="2500" height="auto" alt="image" src="https://github.com/user-attachments/assets/932c328d-eaca-4068-91a7-3052b913a02d" />

## features

- ai generates the story beat by beat as you play, no two runs are the same
- every beat gives you two choices, pick one and the story branches off it
- choices are remembered, sent back to the model each time so the story stays consistent
- story builds up on screen line by line instead of replacing itself
- end story option at any time, or the model can end it naturally
- restart button resets everything for a fresh run

## how to run it locally

```
git clone https://github.com/sahilchess/story-generator.git
cd story-generator
npm install express dotenv
```

create a `.env` file in the root

```
API_KEY=your_hackclub_ai_key
```

start the server

```
node server.js
```

open `http://localhost:3000`

## how it works

the frontend never talks to the ai api directly, it hits a small express backend at `/api/story`, which forwards the request to hack club's ai proxy server side. this was needed because the ai proxy blocks cross origin requests from the browser, so a backend relay was the only way around it without exposing the api key client side.

the model is prompted to return strict json each turn, `beat`, `choice_a`, `choice_b`, `ending`, so the frontend can reliably split the story into sentences and populate the two choice buttons without any parsing guesswork.

model used: nvidia nemotron 3 ultra, free on hack club ai.

## credits

built with hack club's free ai api [here](ai.hackclub.com) and hosted on nest, hack club's free hosting

built for [onekey ysws](onekey.hackclub.com)
