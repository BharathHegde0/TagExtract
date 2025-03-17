const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// For postgres connection
const { Pool } = require("pg");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

// To resolve cors error
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "1234",
    database: "postgres",
});
table = "files";

// Upload file using Multer

const serverUploadPath = path.join(__dirname, "python/uploads/");
const clientUploadPath = path.join(
    __dirname,
    "../client/reactApp/public/uploads"
);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, serverUploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueFIleName = Date.now() + "-" + file.originalname; // Generates a filename that can be used later

        cb(null, uniqueFIleName);
    },
});

const upload = multer({ storage });

// Handle post request from fe
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Insert metadata into the table
        const { filename, size, mimetype } = req.file;
        const fileType = mimetype.startsWith("image")
            ? "image"
            : mimetype.startsWith("video")
            ? "video"
            : "other";

        const result = await pool.query(
            `insert into ${table} (fileName, fileSize, fileType) values 
            ($1, $2, $3) returning id`,
            [filename, (size / 1024).toFixed(0), fileType]
        );

        await pool.query("insert into demographics (fid) values ($1)", [
            result.rows[0].id,
        ]);

        // Copy file to react public folder
        const serverFilePath = path.join(serverUploadPath, filename);
        const clientFilePath = path.join(clientUploadPath, filename);

        fs.copyFile(serverFilePath, clientFilePath, (error) => {
            if (error) {
                console.error(error);
            }
        });

        res.json({
            message: "File uploaded successfully",
            file: result.rows[0],
        });
    } catch (error) {
        console.error("error", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Handle the List
app.get("/getFiles", async (req, res) => {
    try {
        const result = await pool.query(
            `select * from ${table} order by id desc`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/getDemographic", async (req, res) => {
    try {
        const { fid } = req.body;
        // console.log(fid);
        const result = await pool.query(
            "select * from demographics where (fid) = ($1)",
            [fid]
        );
        // console.log(result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Analyze Post Request
app.post("/analyzeTags", async (req, res) => {
    const { fileName, model } = req.body;
    if (!fileName) return res.status(400).json({ error: "No filename" });
    let modelName = "";

    if (model == "vit") {
        modelName = "vit.py";
    } else if (model == "florenceDC") {
        modelName = "florenceDC.py";
    } else if (model == "florenceOD") {
        modelName = "florOD.py";
    } else if (model == "vivit") {
        modelName = "vivitModel.py";
    } else if (model == "videoFlorenceDC") {
        modelName = "videoFlorDC.py";
    } else {
        console.error("Invalid Model");
        return "Invalid Model";
    }

    const filePath = `./python/uploads/${fileName}`;
    // const pythonScript = spawn("python", ["./python/app.py", filePath]);
    const pythonScript = spawn("python", [`./python/${modelName}`, filePath]);

    let result = "";

    // get output from python
    pythonScript.stdout.on("data", (data) => {
        result += data.toString().trim();
    });

    pythonScript.stderr.on("data", (error) => {
        console.error("Error in Python script:", error.toString());
    });

    // access result only after python finishes
    pythonScript.on("close", async (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: "Model did not work" });
        }

        const tags = JSON.parse(result);

        try {
            await pool.query("update files set tags = $1 where filename = $2", [
                tags,
                fileName,
            ]);
            res.json({ tags });
        } catch (error) {
            console.error("Error in Database:", error);
            res.status(500).json({ error: "Table Update failed" });
        }

        pythonScript.stdin.destroy();
        pythonScript.stdout.destroy();
        pythonScript.stderr.destroy();
    });
});

// Analyze Demographics
app.post("/analyzeDemographic", async (req, res) => {
    const { fileID } = req.body;
    if (!fileID) return res.status(400).json({ error: "No filename" });
    let modelName = "phillm.py";

    try {
        const resRow = await pool.query(
            "select tags from files where id = $1",
            [fileID]
        );
        pythonInput = resRow.rows[0].tags.join("\n");

        const pythonScript = spawn("python", [
            `./python/${modelName}`,
            pythonInput,
        ]);

        let result = "";

        // get output from python
        pythonScript.stdout.on("data", (data) => {
            result += data.toString().trim();
        });

        pythonScript.stderr.on("data", (error) => {
            console.error("Error in Python script:", error.toString());
        });

        // access result only after python finishes
        pythonScript.on("close", async (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: "Model did not work" });
            }

            const demoInfo = JSON.parse(result);
            console.log(demoInfo);

            try {
                await pool.query(
                    "update demographics set agerange = $1, gender = $2, lifestyle = $3, interests = $4, income = $5, loc = $6  where fid = $7",
                    [
                        demoInfo[0],
                        demoInfo[1],
                        demoInfo[2],
                        demoInfo[3],
                        demoInfo[4],
                        demoInfo[5],
                        fileID,
                    ]
                );

                res.json({ demoInfo });
            } catch (error) {
                console.error("Error in Database:", error);
                res.status(500).json({ error: "Table Update failed" });
            }

            pythonScript.stdin.destroy();
            pythonScript.stdout.destroy();
            pythonScript.stderr.destroy();
        });
    } catch (error) {
        console.error("Error in Database:", error);
        res.status(500).json({ error: "Table Update failed" });
    }
});

// Delete Row
app.delete("/deleteFile", async (req, res) => {
    try {
        const { id, filename } = req.body;

        if (!id || !filename) {
            console.error("No file id or name");
            return;
        }

        const clientFilePath = path.join(
            __dirname,
            "../client/reactApp/public/uploads",
            filename
        );
        const serverPath = path.join(__dirname, "./python/uploads", filename);

        const deleteFile = (filePath) => {
            return new Promise((resolve) => {
                fs.unlink(filePath, (err) => {
                    if (err && err !== "ENOENT") {
                        console.error(`Error deleting ${filePath}`);
                    }
                    resolve();
                });
            });
        };

        await Promise.all([deleteFile(clientFilePath), deleteFile(serverPath)]);

        await pool.query(`delete from files where id = $1`, [id]);

        res.json({ message: "File Deleted Successfully" });
    } catch (error) {
        console.error("Error deleting", error);
        res.status(500).json({ error: "internal server error" });
    }
});

app.listen(PORT, () => {
    console.log("Server is running");
});
