import { JwtPayload } from "../interfaces";
// Interface for the minimal payload structure we expect from the JWT

/**
 * Decodes a JWT token payload without verifying the signature.
 * NOTE: The Base64URL-safe decoding logic has been secured.
 * @param token The JWT string.
 * @returns The decoded payload object or null if decoding fails.
 */
export const decodeJwt = (token: string): JwtPayload | null => {
    // Deklarera variablerna HÄR i det yttre scopet
    let base64: string; 
    let jsonPayload: string; 
    
    try {
        // 1. Split the token into its parts (header.payload.signature)
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.warn("Invalid JWT structure received (must have 3 parts).");
            return null;
        }
        
        // 2. Base64 URL Decode the payload (the second part)
        base64 = parts[1]; // Tilldelning sker här
        
        // Add padding if needed (Base64 URL Safe)
        switch (base64.length % 4) {
            case 0: break;
            case 2: base64 += '=='; break;
            case 3: base64 += '='; break;
            default: throw new Error('Illegal base64url string!');
        }
        
        // Replace Base64 URL-safe characters
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        
        // 3. Decode from Base64 to a JSON string
        jsonPayload = atob(base64); // Tilldelning sker här
        
        // 4. Parse JSON and return
        return JSON.parse(jsonPayload) as JwtPayload;

    } catch (error) {
        // Fånga fel vid split, atob, JSON.parse, Base64 padding, etc.
        console.error("Error decoding JWT (Token might be invalid or corrupt):", error);
        
        // OM ETT FEL INTRÄFFAR, SKA VI ALLTID RETURNERA NULL.
        // Hade vi försökt JSON.parse(jsonPayload) här hade det kraschat om token.split misslyckades.
        return null; 
    }
};
