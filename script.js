let history = [{ role: "user", content: "start the story" }]
let current_choice_a_text = ""
let current_choice_b_text = ""
let story_log = []
let think_interval = null

const think_words = ["fathoming", "conjuring", "weaving", "pondering", "dreaming", "scheming", "brewing", "unfolding"]

const generate_btn = document.getElementById("generateStoryBtn")
const left_btn = document.getElementById("LeftStoryBtn")
const right_btn = document.getElementById("RightStoryBtn")
const stop_btn = document.getElementById("StopBtn")
const restart_btn = document.getElementById("restartbtn")
const think_p = document.getElementById("aiThinkTextP")
const output_div = document.getElementById("storyOutput")
const main_container = document.querySelector(".main-container")

left_btn.style.display = "none"
right_btn.style.display = "none"
stop_btn.style.display = "none"
stop_btn.textContent = "end story"
restart_btn.style.display = "none"
restart_btn.onclick = () => window.location.reload()

function random_think_word() {
  return think_words[Math.floor(Math.random() * think_words.length)]
}

function start_thinking_animation() {
  const word = random_think_word()
  let dots = 0
  think_p.textContent = word
  think_interval = setInterval(() => {
    dots = (dots % 4) + 1
    think_p.textContent = word + ".".repeat(dots)
  }, 400)
}

function stop_thinking_animation() {
  clearInterval(think_interval)
}

async function get_next_beat() {
  const res = await fetch("/api/story", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [
        {
          role: "system",
          content: "you are a choose your own adventure story engine. respond with only raw json, no markdown, no code fences. schema: {\"beat\": string, \"choice_a\": string, \"choice_b\": string, \"ending\": boolean}. the beat is only narrative, never mention or hint at the two choices inside it. keep beat to 2 to 3 short sentences. set ending true only when the story should stop."
        },
        ...history
      ],
      temperature: 0.9
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`api error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const raw = data.choices[0].message.content.replace(/```json|```/g, "").trim()
  return JSON.parse(raw)
}

function append_beat(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  sentences.forEach(sentence => {
    story_log.push(sentence.trim())
    const line = document.createElement("p")
    line.textContent = sentence.trim()
    output_div.appendChild(line)
  })
}

function show_finished_story() {
  main_container.innerHTML = ""

  const heading = document.createElement("h1")
  heading.textContent = "here's your finished story!"
  main_container.appendChild(heading)

  story_log.forEach(sentence => {
    const line = document.createElement("p")
    line.textContent = sentence
    main_container.appendChild(line)
  })

  restart_btn.style.display = "inline-block"
}

async function advance(chosen_text) {
  if (chosen_text) {
    history.push({ role: "user", content: `player chose: ${chosen_text}` })
  }

  generate_btn.style.display = "none"
  left_btn.style.display = "none"
  right_btn.style.display = "none"
  stop_btn.style.display = "none"
  start_thinking_animation()
  think_p.style.display = "block"

  try {
    const beat = await get_next_beat()
    history.push({ role: "assistant", content: JSON.stringify(beat) })

    append_beat(beat.beat)

    if (beat.ending) {
      show_finished_story()
      return
    }

    current_choice_a_text = beat.choice_a
    current_choice_b_text = beat.choice_b

    left_btn.textContent = beat.choice_a
    right_btn.textContent = beat.choice_b

    left_btn.style.display = "inline-block"
    right_btn.style.display = "inline-block"
    stop_btn.style.display = "inline-block"
  } catch (err) {
    console.error(err)
    append_beat("error: " + err.message)
  } finally {
    stop_thinking_animation()
    think_p.style.display = "none"
  }
}

generate_btn.onclick = () => advance(null)
left_btn.onclick = () => advance(current_choice_a_text)
right_btn.onclick = () => advance(current_choice_b_text)
stop_btn.onclick = () => show_finished_story()