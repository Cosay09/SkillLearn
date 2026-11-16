import * as authService from "../services/authService.js";

export async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const result = await authService.login(req.body);
  res.json(result);
}

export async function me(req, res) {
  const user = await authService.getUserById(req.userId);
  res.json({ user });
}

export async function verifyEmail(req, res) {
  const user = await authService.verifyEmail(req.body.token);
  res.json({ user });
}

export async function resendVerification(req, res) {
  await authService.resendVerification(req.userId);
  res.json({ ok: true });
}
