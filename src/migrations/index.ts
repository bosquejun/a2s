import * as migration_20260615_000000_facebook_integration from "./20260615_000000_facebook_integration";

export const migrations = [
  {
    up: migration_20260615_000000_facebook_integration.up,
    down: migration_20260615_000000_facebook_integration.down,
    name: "20260615_000000_facebook_integration",
  },
];
