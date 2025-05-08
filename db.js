import pg from "pg";
import dotenv from "dotenv"

dotenv.config()

const client = new pg.Client({
	user: "postgres",
	host: process.env.HOST,
	database: "railway",
	password: process.env.PGPASSWORD, // Replace with your actual password
	port: process.env.PORT,
	ssl: {
		rejectUnauthorized: false,
	},
});

client.connect()

export default client
