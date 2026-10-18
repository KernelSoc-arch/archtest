import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const GMOD_APP_ID = 4000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/workshop", async (req, res) => {
  try {
    if (!STEAM_API_KEY) {
      return res.status(503).json({ error: "Steam API key is not configured on the server." });
    }

    const id = String(req.query.id || "").trim();
    const search = String(req.query.search || "").trim();

    if (id) {
      if (!/^\d{6,20}$/.test(id)) {
        return res.status(400).json({ error: "Enter a valid numeric Workshop ID." });
      }
      const body = new URLSearchParams();
      body.set("itemcount", "1");
      body.set("publishedfileids[0]", id);

      const response = await fetch(
        "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
        { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }
      );
      if (!response.ok) throw new Error(`Steam API returned HTTP ${response.status}`);
      const json = await response.json();
      const item = json?.response?.publishedfiledetails?.[0];
      if (!item || Number(item.result) !== 1) {
        return res.status(404).json({ error: "Steam could not find a public Workshop item with that ID." });
      }
      if (Number(item.consumer_app_id) !== GMOD_APP_ID && Number(item.creator_app_id) !== GMOD_APP_ID) {
        return res.status(404).json({ error: "That item does not appear to belong to Garry's Mod." });
      }
      return res.json({ item: normalizeItem(item) });
    }

    if (!search) return res.status(400).json({ error: "Enter a search term or Workshop ID." });
    if (search.length > 100) return res.status(400).json({ error: "Search is too long (max 100 characters)." });

    // Steam's QueryFiles service supports searching Workshop items; the API key stays server-side.
    const params = new URLSearchParams({
      key: STEAM_API_KEY,
      query_type: "0",
      page: "1",
      numperpage: "30",
      appid: String(GMOD_APP_ID),
      search_text: search,
      return_metadata: "0",
      return_previews: "1",
      return_vote_data: "0",
      return_children: "0",
      return_short_description: "1"
    });
    const response = await fetch(
      `https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/?${params.toString()}`
    );
    if (!response.ok) throw new Error(`Steam API returned HTTP ${response.status}`);
    const json = await response.json();
    const payload = json?.response;
    if (!payload) throw new Error("Steam returned an unexpected response.");
    const rawItems = payload.publishedfiledetails || payload.files || [];
    return res.json({
      items: rawItems.map(normalizeItem),
      total: Number(payload.total || payload.total_count || rawItems.length)
    });
  } catch (error) {
    console.error("Workshop API error:", error);
    res.status(502).json({ error: "Could not reach Steam Workshop right now. Please try again." });
  }
});

function normalizeItem(item) {
  return {
    publishedfileid: String(item.publishedfileid || ""),
    title: item.title || "Untitled Workshop item",
    creator: item.creator || item.owner || "",
    preview_url: item.preview_url || item.preview || "",
    consumer_app_id: Number(item.consumer_app_id || 0),
    creator_app_id: Number(item.creator_app_id || 0)
  };
}

app.listen(PORT, () => {
  console.log(`GMod Workshop ID Copier running at http://localhost:${PORT}`);
});
