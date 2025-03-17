import React, { use, useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import "./App.css";

import InputList from "./components/InputList";
import FileUpload from "./components/FileUpload";
import Modal from "./components/Modal";

const App = () => {
    // Get reequest to display the files
    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get("http://localhost:3000/getFiles");

            setFiles(response.data);
        } catch (error) {
            console.error("Get error: ", error);
        }
    };

    // delete row function
    const handleDeleteRow = async (fileID, filename) => {
        try {
            await axios.delete("http://localhost:3000/deleteFile", {
                data: { id: fileID, filename: filename },
            });
            setFiles((prevFiles) =>
                prevFiles.filter((file) => file.id !== fileID)
            );
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <>
            <section class="table__header">
                <h1>TagExtract</h1>
            </section>
            <div className="main-container-wrapper">
                {/* <div className="choose-approach">
                    <span>Choose Approach : </span>{" "}
                    <select name="" id="">
                        <option value="">Two Step Analysis</option>
                        <option value="">One Step Analysis</option>
                    </select>
                </div> */}
                <div className="main-container">
                    <InputList
                        files={files}
                        fetchUpdatedFiles={fetchFiles}
                        handleDeleteRow={handleDeleteRow}
                    />
                    <FileUpload fetchFiles={fetchFiles} />
                </div>
            </div>
        </>
    );
};

export default App;
