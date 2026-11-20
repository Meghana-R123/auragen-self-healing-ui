export function calculateFrictionScore(signals = {}) {
  const rageClicks = Math.min(Number(signals.rageClicks || 0), 5);
  const hesitationSeconds = Math.max(Number(signals.hesitationSeconds || 0), 0);
  const erraticMovement = Math.max(0, Math.min(Number(signals.erraticMovement || 0), 1));
  const invalidAttempts = Math.min(Number(signals.invalidAttempts || 0), 5);

  const score =
    (rageClicks / 5) * 30 +
    (Math.min(hesitationSeconds, 20) / 20) * 25 +
    erraticMovement * 25 +
    (invalidAttempts / 5) * 20;

  return Math.round(Math.max(0, Math.min(score, 100)));
}
