/**
 * @interface AuthResponse
 * Standard response object for successful authentication.
 */
export interface AuthResponse {
  /**
   * @property {string} access_token - JWT for authorization
   */
  access_token: string;

  /**
   * @property {string} refresh_token - JWT for session renewal
   */
  refresh_token: string;

  /**
   * @property {number} expires_at - The expiration timestamp of the access token
   */
  expires_at: number;
}
