import { getCurrentUser } from "@/lib/auth";

const pointsKey = (userId: string) => `farmconnect-points-${userId}`;
const walletKey = (userId: string) => `farmconnect-wallet-${userId}`;

export const REWARD_POINTS_PER_PURCHASE = 10;
export const POINTS_PER_CASH_UNIT = 100; // 100 points -> 50 rupees
export const CASH_PER_POINTS = 50; // ₹50 for 100 points

export function getUserId(): string | null {
  const user = getCurrentUser();
  return user?.id || null;
}

export function getPoints(): number {
  const userId = getUserId();
  if (!userId) return 0;
  const raw = localStorage.getItem(pointsKey(userId));
  return raw ? parseInt(raw) || 0 : 0;
}

export function addPoints(points: number) {
  const userId = getUserId();
  if (!userId) return;
  const current = getPoints();
  localStorage.setItem(pointsKey(userId), String(current + points));
}

export function setPoints(points: number) {
  const userId = getUserId();
  if (!userId) return;
  localStorage.setItem(pointsKey(userId), String(Math.max(0, Math.floor(points))));
}

export function getWalletBalance(): number {
  const userId = getUserId();
  if (!userId) return 0;
  const raw = localStorage.getItem(walletKey(userId));
  return raw ? parseFloat(raw) || 0 : 0;
}

export function addToWallet(amount: number) {
  const userId = getUserId();
  if (!userId) return;
  const current = getWalletBalance();
  localStorage.setItem(walletKey(userId), String((current + amount).toFixed(2)));
}

export function pointsToCash(points: number): number {
  // 100 points -> 50 rs
  const bundles = Math.floor(points / POINTS_PER_CASH_UNIT);
  return bundles * CASH_PER_POINTS;
}

export function redeemAllPossible(): { redeemedPoints: number; cashAdded: number; remainingPoints: number } {
  const userId = getUserId();
  if (!userId) return { redeemedPoints: 0, cashAdded: 0, remainingPoints: 0 };
  const current = getPoints();
  const bundles = Math.floor(current / POINTS_PER_CASH_UNIT);
  const redeemPts = bundles * POINTS_PER_CASH_UNIT;
  const cash = bundles * CASH_PER_POINTS;
  if (redeemPts <= 0) return { redeemedPoints: 0, cashAdded: 0, remainingPoints: current };
  setPoints(current - redeemPts);
  addToWallet(cash);
  return { redeemedPoints: redeemPts, cashAdded: cash, remainingPoints: current - redeemPts };
}
