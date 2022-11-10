import dotenv from "dotenv";
dotenv.config();

const host = process.env["HOST"];
const port = process.env["PORT"];

console.log(`Server is running on http://${host}:${port}/`);
