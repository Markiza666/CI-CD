import { JwtPayload } from "../interfaces";
// Interface for the minimal payload structure we expect from the JWT

/**
 * Decodes a JWT token payload without verifying the signature.
 *
 * This function handles the Base64URL-safe encoding specific to JWTs
 * before converting it to a JSON object.
 *
 * @param token The JWT string (Header.Payload.Signature).
 * @returns The decoded payload object or null if decoding fails.
 */
export const decodeJwt = (token: string): JwtPayload | null => {
    try {
        // 1. Split the token into its parts (header.payload.signature)
        const parts = token.split('.');
        if (parts.length !== 3) {
            // Log this as an error/warning since it indicates a malformed token
            console.warn("Invalid JWT structure received (must have 3 parts). Token:", token);
            return null;
        }
        
        // 2. Base64 URL Decode the payload (the second part)
        let base64Url = parts[1];
        
        // Convert Base64URL to regular Base64 by handling padding and character replacement.
        // Replace Base64 URL-safe characters '-' with '+' and '_' with '/'
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Pad the Base64 string if necessary (critical for atob/Buffer conversion)
        switch (base64.length % 4) {
            case 0: break;
            case 2: base64 += '=='; break;
            case 3: base64 += '='; break;
            default: 
                console.error('Illegal base64url string length detected!');
                return null;
        }

        // 3. Decode from Base64 to a JSON string
        const jsonPayload = atob(base64);
        
        // 4. Parse JSON and return
        // We use JSON.parse inside the try-block, so any parsing error is caught.
        return JSON.parse(jsonPayload) as JwtPayload;

    } catch (error) {
        // Catch any error during split, replace, atob, or JSON.parse.
        console.error("Error decoding JWT (Token might be invalid or corrupt):", error);
        return null; 
    }
};
