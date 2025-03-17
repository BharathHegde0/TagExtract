import { useState } from "react";

// React-icons import
import {
    FaRegFileImage,
    FaRegFileVideo,
    FaRegCheckCircle,
} from "react-icons/fa";

import axios from "axios";
import "./FileUpload.css";

const FileUpload = ({ fetchFiles }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Handle change in file input, both select and drag
    const handleFileSelect = (event) => {
        setUploadProgress(0);
        const file = event.target.files[0];
        if (file) setSelectedFile(file);
        event.target.value = null;
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setUploadProgress(0);
        const file = event.dataTransfer.files[0];
        if (file) setSelectedFile(file);
        event.target.value = null;
    };

    // handle uploading the file, post req
    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            await axios.post("http://localhost:3000/upload", formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            setUploadProgress(100);

            fetchFiles(); // get file list from postgres
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        // Drag and drop area
        <div className="upload-container">
            <div
                className="drop-area"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("fileInput").click()}
            >
                Drag & Drop or Click to upload
            </div>
            <input
                type="file"
                id="fileInput"
                onChange={handleFileSelect}
                style={{ display: "none" }}
            />
            {/* Upload button only shows when a file is selected */}
            {selectedFile && (
                <button className="upload-button" onClick={handleUpload}>
                    Upload
                </button>
            )}

            {/* previw of file with progress bar */}
            {selectedFile && (
                <div className="file-preview">
                    {console.log(selectedFile)}
                    <span className="upload-file-icon">
                        {selectedFile.type.startsWith("image") ? (
                            <FaRegFileImage />
                        ) : (
                            <FaRegFileVideo />
                        )}
                        <span className="upload-file-name">
                            <p>{selectedFile.name}</p>
                        </span>
                    </span>
                    {uploadProgress == 100 ? (
                        <FaRegCheckCircle
                            className="progress-complete-check"
                            fill="green"
                        />
                    ) : (
                        <div className="progress-bar">
                            <div
                                className="progress"
                                style={{
                                    width: `${uploadProgress}%`,
                                }}
                            ></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
