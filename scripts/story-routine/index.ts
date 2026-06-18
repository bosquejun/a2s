// Entry point for the daily story-generation routine CLI.
//
//   pnpm story:survey                 # print variety + engagement context (JSON)
//   pnpm story:publish a.json b.json  # validate + publish finished stories
//
// See docs/routines/story-generation.md for how the scheduled agent uses these.

import { publish } from "./publish";
import { survey } from "./survey";
import { fail } from "./lib";

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  switch (command) {
    case "survey":
      await survey();
      break;
    case "publish":
      await publish(rest);
      break;
    default:
      fail(`unknown command "${command ?? ""}". expected: survey | publish`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
