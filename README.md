# Proton

Ever wanted a Bot to help you manage your Server? Well the answer is Proton

It has all the features you want online user tracking or welcome and goodbye messages

## Getting started

Proton runs on [Bun](https://bun.sh) — there is no build step and no Node toolchain.

1. Install dependencies:

   ```sh
   bun install
   ```

2. Provide secrets. Proton reads them from the environment via [SecretSpec](https://secretspec.dev); the required and optional variables are declared in `secretspec.toml` and documented in `.env.example`:

   | Variable                 | Required | Purpose                                            |
   | ------------------------ | -------- | -------------------------------------------------- |
   | `TOKEN`                  | yes      | Bot token                                          |
   | `DISCORD_APPLICATION_ID` | yes      | Application id, used to register commands          |
   | `DISCORD_GUILD_ID`       | no       | Register commands to one guild for instant updates |
   | `DATABASE_PATH`          | no       | SQLite file, defaults to `./database.sqlite`       |

   Install SecretSpec with `curl -sSfL https://secretspec.dev/install.sh | sh`, then `secretspec init` and set your values.

3. Register the slash commands:

   ```sh
   secretspec run -- bun run deploy
   ```

4. Start the bot:

   ```sh
   secretspec run -- bun run dev
   ```

Migrations run automatically at startup, so there is no separate database setup step.

### Scripts

| Script                | What it does                                                   |
| --------------------- | -------------------------------------------------------------- |
| `bun run dev`         | Start with watch-reload                                        |
| `bun run start`       | Start once                                                     |
| `bun run deploy`      | Register commands (`--delete-all` clears them)                 |
| `bun run db:generate` | Generate a Drizzle migration after changing `src/db/schema.ts` |
| `bun test`            | Run the test suite                                             |
| `bun run typecheck`   | Typecheck with `tsc --noEmit`                                  |
| `bun run lint`        | Lint with ESLint                                               |
| `bun run format`      | Format with Prettier                                           |

> Note: set `DISCORD_GUILD_ID` while developing — guild-scoped commands update instantly, whereas global ones can take up to an hour to propagate.

### Deploying as a systemd service

```sh
sudo ./deploy/install.sh
secretspec export --profile production --format dotenv | sudo tee /etc/proton/proton.env
sudo chmod 600 /etc/proton/proton.env
secretspec run --profile production -- bun run deploy   # register slash commands
sudo systemctl start proton
```

The installer creates a `proton` system user, installs the application to `/opt/proton`,
and enables a sandboxed unit that keeps its database in `/var/lib/proton`. Secrets are read
by systemd from a root-owned `0600` environment file, so the bot's own user never has access
to them. Re-run `install.sh` to upgrade; it never touches the database or an existing
environment file.

> **NixOS:** `install.sh` is imperative and will not survive a `nixos-rebuild`. Declare a
> `systemd.services.proton` unit in your configuration instead — `deploy/proton.service` is
> a reasonable starting point for its settings.

### Migrating from the pre-2.0 bot

The old Sequelize database is imported automatically and losslessly. Rename it to
`database.legacy.sqlite` in the project root and start the bot once; guilds, warns and
custom messages are copied into the new schema. The import skips any table that already
has rows, so it is safe to leave the file in place.

### For NixOS users

> :information_source: `nix develop` gives you a shell with Bun available.

## Usage

`/help` - shows all of the Bots commands

## Badges

[![GPLv3 License](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://choosealicense.com/licenses/gpl-3.0/)

## Co-Authors

- [@LordVertice](https://github.com/LordVertice)
- [@TomSnd01](https://github.com/TomSnd01)

## Support

For support, join our [Discord Server](https://discord.com/invite/vbRQB8PV9X)

## Copyright

Copyright (c) 2022-2042 Niklas Choinowski and contributors
