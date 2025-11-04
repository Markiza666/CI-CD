// Interface for the minimal payload structure we expect from the JWT
// This typically contains the user ID (sub) and email.
interface JwtPayload {
  _id: string; // The user's ID, often named 'sub' or '_id' in the payload
  email: string;
  iat: number; // Issued At
  exp: number; // Expiration time
}

/**
 * Decodes a JWT token payload without verifying the signature.
 * WARNING: This is for client-side convenience (reading data) only. 
 * Token validity is always checked by the backend API.
 * * @param token The JWT string.
 * @returns The decoded payload object or null if decoding fails.
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    // 1. Split the token into its parts (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn("Invalid JWT structure received.");
      return null;
    }
    
    // 2. Base64 URL Decode the payload (the second part)
    // We replace characters to correctly handle Base64URL encoding
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    
    // 3. Decode from Base64 to a JSON string
    // In a browser environment, atob() is the standard way.
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    // 4. Parse the JSON string into the payload object
    return JSON.parse(jsonPayload) as JwtPayload;

  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};
