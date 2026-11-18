import { dataClient } from '../lib/dataClient';

/**
 * Read the persisted InsForge session and matching profile.
 * @returns {Promise<{user: {id: string, email: string}, profile: object} | null>}
 */
export async function getSession() {
  try {
    return await dataClient.auth.getSession();
  } catch {
    return null;
  }
}

/**
 * Sign in with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{user: object, profile: object}>}
 */
export async function signIn(credentials) {
  return dataClient.auth.signIn(credentials);
}

/**
 * Create a new customer account.
 * @param {{ fullName: string, email: string, password: string }} details
 * @returns {Promise<{user: object, profile: object}>}
 */
export async function signUp(details) {
  return dataClient.auth.signUp(details);
}

/**
 * End the current session.
 * @returns {Promise<void>}
 */
export async function signOut() {
  await dataClient.auth.signOut();
}
