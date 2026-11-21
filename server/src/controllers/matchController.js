import * as matchService from "../services/matchService.js";

export async function list(req, res) {
  const result = await matchService.findMatches(req.userId);
  res.json(result);
}
