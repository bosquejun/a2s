import { customAlphabet } from "nanoid"

const nanoid = customAlphabet(
  "23456789abcdefghjkmnpqrstuvwxyz", // no 0,1,i,l,o
  4
)

const WORDS = [
  "moon",
  "quiet",
  "echo",
  "late",
  "still",
  "empty",
  "tired",
  "alone",
  "blue",
  "soft",
  "drift",
  "awake",
  "dim",
  "slow",
  "hollow",
  "near",
  "far",
  "low",
  "cold",
  "warm",
  "heavy",
  "thin",
  "faint",
  "dark",
  "mild",
  "calm",
  "rest",
  "wait",
  "pause",
  "after",
  "night",
  "sleep",
  "miss",
  "quiet",
  "softly",
  "bare",
  "open",
  "lost",
  "hold",
  "fade",
  "alone",
  "stillness",
  "echoes",
  "tiredness",
  "awake",
  "latehour"
]

export function generateTrackCode() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)]
  const code = nanoid().toLowerCase()
  return `${word}-${code}`
}
