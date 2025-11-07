import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET saknas i miljövariabler");
}

export const JWT_SECRET = process.env.JWT_SECRET;

console.log("✅ JWT_SECRET loaded:", JWT_SECRET);