require("dotenv").config()
const express = require("express")
const app = express()
app.use(express.json())
app.use(express.static("."))

const api_key = process.env.API_KEY

app.post("/api/story", async (req, res) => {
  const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${api_key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)
  })

  if (!response.ok) {
    const errText = await response.text()
    console.log("hackclub error:", response.status, errText)
  }

  const data = await response.json()
  res.json(data)
})
console.log("key loaded:", process.env.API_KEY ? "yes" : "no")
app.listen(3000, () => console.log("running on 3000"))