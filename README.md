# GMod Workshop ID Copier

A minimal, responsive Garry's Mod Workshop search page. Each result has one action: copy its numeric Workshop ID using a Material Icons copy icon.

## Requirements
- Node.js 18+ (built-in `fetch`)
- A Steam Web API key configured on the server

## Run locally
1. Unzip the project.
2. Open a terminal in the project folder and run `npm install`.
3. Set the `STEAM_API_KEY` environment variable.
   - macOS/Linux: `export STEAM_API_KEY="your_key_here"`
   - PowerShell: `$env:STEAM_API_KEY="your_key_here"`
4. Run `npm start`.
5. Open http://localhost:3000

Never put your Steam API key in `public/` or commit it to source control.

## API
- `GET /api/workshop?search=wiremod` — searches Workshop for app ID 4000 (Garry's Mod).
- `GET /api/workshop?id=123456789` — fetches item details by ID and checks that the item belongs to Garry's Mod.

Uses Steam Web API:
- `IPublishedFileService/QueryFiles`
- `ISteamRemoteStorage/GetPublishedFileDetails`

Steam's API schema and access requirements can change. If QueryFiles returns an API error or a different response shape, adjust the request/normalization in `server.js` to match the current Steamworks documentation. This is an unofficial community tool and is not affiliated with Valve or Facepunch.
