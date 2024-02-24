# Obsidian Simple Glossary

This is a simple glossary plugin for Obsidian (https://obsidian.md).

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in Typescript Definition format, which contains TSDoc comments describing what it does.

**Note:** The Obsidian API is still in early alpha and is subject to change at any time!

## How to used before official release (and to contribute!)

Quick starting guide for new plugin devs:

- Install NodeJS (https://nodejs.org/en).
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- Open a terminal at `path/to/vault/.obsidian/plugins`
- Clone this repo (`git clone https://github.com/Light52566/Simple-Glossary.git`)
- navigate inside the repository (`cd Simple-Glossary`)
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## API Documentation

See https://github.com/obsidianmd/obsidian-api
