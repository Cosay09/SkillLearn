import * as skillService from "../services/skillService.js";

export async function list(req, res) {
  const skills = await skillService.listSkills({
    search: req.query.search,
    category: req.query.category,
  });
  res.json({ skills });
}

export async function create(req, res) {
  const skill = await skillService.createSkill(req.body);
  res.status(201).json({ skill });
}
