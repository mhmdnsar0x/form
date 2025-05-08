import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fsp from "fs/promises"; // Use the promise-based version of fs
import fs from "fs"
import FormData from "form-data";
import client from "./db.js";

dotenv.config();
const app = express();
app.use(express.json());

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});
const upload = multer({ storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));

async function push(title, body, fileUrl) {
	try {
		await axios.post(
			process.env.PUSHBULLET_API,
			{
				type: "file",
				title: title || "New File Upload",
				body: body || "Here is your uploaded file",
				file_url: fileUrl,
				file_name: "Uploaded Image",
				file_type: "image/jpeg",
			},
			{
				headers: {
					"Access-Token": process.env.PUSHBULLET_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);
		console.log("Push notification sent successfully!");
	} catch (err) {
		console.error("Pushbullet error:", err.response?.data || err.message);
	}
}

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/submit", upload.single("image"), async (req, res) => {
	const { balance, phone, paymentMethod, senderInfo } = req.body;

	try {
		// Request an upload URL from Pushbullet
		const uploadRequest = await axios.post(
			"https://api.pushbullet.com/v2/upload-request",
			{
				file_name: req.file.originalname,
				file_type: req.file.mimetype,
			},
			{
				headers: {
					"Access-Token": process.env.PUSHBULLET_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);

		// Upload the file to Pushbullet
		const formData = new FormData();
		formData.append("file", fs.createReadStream(req.file.path));
		await axios.post(uploadRequest.data.upload_url, formData, {
			headers: {
				...formData.getHeaders(),
			},
		});

		// Delete the file from the local server
		await push(
			"New order",
			`Balance amount: ${balance}\nPhone number: ${phone}\nPayment Method: ${paymentMethod}\nCash sender: ${
				senderInfo[0] ? senderInfo[0] : senderInfo[1]
			}`,
			uploadRequest.data.file_url
		);
		await fsp.unlink(req.file.path);

		// Save transaction details to the database
		await client.query(
			"INSERT INTO transactions(balance, phone, payment_method, sender_info, screenshot) VALUES($1, $2, $3, $4, $5)",
			[
				balance,
				phone,
				paymentMethod,
				senderInfo[0] ? senderInfo[0] : senderInfo[1],
				uploadRequest.data.file_url,
			]
		);

		// Send a push notification
	
res.status(200)	} catch (err) {
		console.error(
			"Error in file upload or push:",
			err.response?.data || err.message
		);
		if (req.file && req.file.path) {
			try {
				 fs.unlink(req.file.path);
				console.log(`File ${req.file.path} deleted after error.`);
			} catch (deleteErr) {
				console.error(`Failed to delete file ${req.file.path}:`, deleteErr.message);
			}
		}

	
		res.status(500).json({ error: "Failed to upload and push file" });
	}

});

app.listen(3000, () => {
	console.log("Server is listening on port 3000");
});
