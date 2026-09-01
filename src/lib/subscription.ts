import type { Profile } from '@/lib/supabase';

export type AccessLevel = 'full' | 'trial_warning' | 'locked';

export interface SubscriptionStatus {
  level: AccessLevel;
  daysRemaining: number;
  daysElapsed: number;
  isPro: boolean;
  isTrial: boolean;
  isExpired: boolean;
  isAdmin: boolean;
}

export function getSubscriptionStatus(profile: Profile | null): SubscriptionStatus {
  if (!profile) {
    return { level: 'locked', daysRemaining: 0, daysElapsed: 0, isPro: false, isTrial: false, isExpired: true, isAdmin: false };
  }

  if (profile.is_admin) {
    return { level: 'full', daysRemaining: 0, daysElapsed: 0, isPro: true, isTrial: false, isExpired: false, isAdmin: true };
  }

  if (profile.subscription_status === 'pro') {
    return { level: 'full', daysRemaining: 0, daysElapsed: 0, isPro: true, isTrial: false, isExpired: false, isAdmin: false };
  }

  if (profile.subscription_status === 'expired') {
    return { level: 'locked', daysRemaining: 0, daysElapsed: 0, isPro: false, isTrial: false, isExpired: true, isAdmin: false };
  }

  // trial status
  const trialStart = new Date(profile.trial_start_date);
  const now = new Date();
  const msElapsed = now.getTime() - trialStart.getTime();
  const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 3 - daysElapsed);

  if (daysElapsed >= 3) {
    return { level: 'locked', daysRemaining: 0, daysElapsed, isPro: false, isTrial: true, isExpired: true, isAdmin: false };
  }

  if (daysElapsed >= 1) {
    return { level: 'trial_warning', daysRemaining, daysElapsed, isPro: false, isTrial: true, isExpired: false, isAdmin: false };
  }

  return { level: 'full', daysRemaining, daysElapsed, isPro: false, isTrial: true, isExpired: false, isAdmin: false };
}

export function canReadContent(status: SubscriptionStatus): boolean {
  return status.level === 'full' || status.level === 'trial_warning';
}

export function canWriteContent(status: SubscriptionStatus): boolean {
  return status.level === 'full' || status.level === 'trial_warning';
}

export function isLocked(status: SubscriptionStatus): boolean {
  return status.level === 'locked';
}

export function shouldShowUpgradeBanner(status: SubscriptionStatus): boolean {
  return status.level === 'trial_warning';
}
