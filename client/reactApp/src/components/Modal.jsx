// import React, { useState, useEffect } from "react";
// import "./Modal.css";
// import Tag from "./Tag";
// import { AiOutlineCloseCircle } from "react-icons/ai";

// import axios from "axios";
// import LoadingOverlay from "./LoadingOverlay";

// const Modal = ({ isOpen, onClose, fileInfo, fetchUpdatedFiles, className }) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [tagsSet, setTagsSet] = useState(fileInfo.tags || []);
//     const [selectedModel, setSelectedModel] = useState("");

//     useEffect(() => {
//         setTagsSet(fileInfo.tags || []);
//     }, [fileInfo]);

//     const handleAnalyze = async () => {
//         if (selectedModel == "") {
//             alert("Please select a model");
//             return;
//         }

//         if (isLoading) {
//             console.log("Loading Already in progress");
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const response = await axios.post("http://localhost:3000/analyze", {
//                 fileName: fileInfo.filename,
//                 model: selectedModel,
//             });

//             setTagsSet(response.data.tags);
//             fileInfo.tags = response.data.tags;
//             fetchUpdatedFiles();
//         } catch (error) {
//             console.error("Error Analyzing: ", error);
//         }
//         setIsLoading(false);
//     };

//     const handleModelChange = (e) => {
//         setSelectedModel(e.target.value);
//     };

//     if (!isOpen) return null;

//     return (
//         <section className={`modal-wrapper ${className}`}>
//             <div className="modal">
//                 <AiOutlineCloseCircle
//                     className="modal-close-button"
//                     onClick={onClose}
//                 />
//                 <div className="modal-data-top">
//                     {/* image of video thumbnail */}
//                     {fileInfo.filetype === "image" ? (
//                         <img
//                             className="media media-image"
//                             src={`/uploads/${fileInfo.filename}`}
//                             alt="an image"
//                             loading="lazy"
//                         />
//                     ) : (
//                         <video className="media media-video" controls>
//                             <source src={`/uploads/${fileInfo.filename}`} />
//                         </video>
//                     )}

//                     {/* Loading Overlay */}
//                     {isLoading && <LoadingOverlay />}

//                     <div className="modal-details">
//                         <h2>File Details:</h2>
//                         <span className="modal-file-name">
//                             <h4>File Name: </h4>
//                             <p>{fileInfo.filename.substring(14)}</p>
//                         </span>
//                         <span>
//                             <h4>Size: </h4>
//                             <p>{fileInfo.filesize} KB</p>
//                         </span>
//                         <span>
//                             <h4>Type: </h4>
//                             <p>{fileInfo.filetype} </p>
//                         </span>
//                     </div>
//                 </div>
//                 <div className="modal-data-bottom">
//                     <div className="model-choose-run-container">
//                         <button
//                             key={isLoading ? "loading" : "normal"}
//                             onClick={handleAnalyze}
//                             disabled={isLoading}
//                             className="analyze-button"
//                         >
//                             {isLoading ? "Loading..." : "✨ Analyze"}
//                         </button>
//                         <div className="choose-model-options">
//                             <p>Choose Model: </p>
//                             {fileInfo.filetype == "image" ? (
//                                 <select
//                                     value={selectedModel}
//                                     onChange={handleModelChange}
//                                 >
//                                     <option disabled value="">
//                                         --Pick a Model--
//                                     </option>
//                                     <option value="vit">ViT (Faster)</option>
//                                     {/* <option value="florenceOD">
//                                     Florence 2 OD
//                                 </option> */}
//                                     <option value="florenceDC">
//                                         Florence 2 DC (Usually More Accurate)
//                                     </option>
//                                 </select>
//                             ) : (
//                                 <select
//                                     value={selectedModel}
//                                     onChange={handleModelChange}
//                                 >
//                                     <option disabled value="">
//                                         --Pick a Model--
//                                     </option>
//                                     <option value="vivit">
//                                         ViViT (Faster)
//                                     </option>
//                                     <option value="videoFlorenceDC">
//                                         Florence 2 DC (More Accurate)
//                                     </option>
//                                 </select>
//                             )}
//                         </div>
//                     </div>

//                     <div className="tag-container-wrapper">
//                         <h1>Tags:</h1>

//                         <div className="tag-container">
//                             {tagsSet.length > 0 ? (
//                                 tagsSet.map((tag, index) => (
//                                     <Tag key={index} tagName={tag} />
//                                 ))
//                             ) : (
//                                 <span>
//                                     There are no tags yet. Pick a{" "}
//                                     <span className="analyze-bold">Model</span>{" "}
//                                     and click{" "}
//                                     <span className="analyze-bold">
//                                         Analyze
//                                     </span>{" "}
//                                     to generate some tags.
//                                 </span>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default Modal;

import React, { useState, useEffect } from "react";
import "./Modal.css";
import Tag from "./Tag";
import { AiOutlineCloseCircle } from "react-icons/ai";

import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import DemographicCard from "./DemographicCard";

const Modal = ({ isOpen, onClose, fileInfo, fetchUpdatedFiles, className }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [tagsSet, setTagsSet] = useState(fileInfo.tags || []);
    const [selectedModel, setSelectedModel] = useState("");
    const [demoRow, setDemoRow] = useState([]);

    useEffect(() => {
        setTagsSet(fileInfo.tags || []);
    }, [fileInfo]);

    useEffect(() => {
        fetchDemographics();
    }, []);

    const fetchDemographics = async () => {
        try {
            // console.log(fileInfo.id);
            const response = await axios.post(
                "http://localhost:3000/getDemographic",
                {
                    fid: fileInfo.id,
                }
            );
            if (response.data) {
                // console.log(response.data);
                setDemoRow(response.data);
            }
        } catch (error) {
            console.error("Get error: ", error);
        }
    };

    const handleAnalyze = async () => {
        if (selectedModel == "") {
            alert("Please select a model");
            return;
        }

        if (isLoading) {
            console.log("Loading Already in progress");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:3000/analyzeTags",
                {
                    fileName: fileInfo.filename,
                    model: selectedModel,
                }
            );

            setTagsSet(response.data.tags);
            fileInfo.tags = response.data.tags;
            fetchUpdatedFiles();
        } catch (error) {
            console.error("Error Analyzing: ", error);
        }
        setIsLoading(false);
    };

    const handleModelChange = (e) => {
        setSelectedModel(e.target.value);
    };

    const handleAnalyzeDemographic = async () => {
        if (isLoading) {
            console.log("Loading Already in progress");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:3000/analyzeDemographic",
                {
                    fileID: fileInfo.id,
                }
            );

            setDemoRow(response.data);

            // fileInfo.tags = response.data.tags;
            // fetchUpdatedFiles();
            fetchDemographics();
        } catch (error) {
            console.error("Error Analyzing: ", error);
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <section className={`modal-wrapper ${className}`}>
            <div className="modal">
                <AiOutlineCloseCircle
                    className="modal-close-button"
                    onClick={onClose}
                />
                <div className="modal-data-top">
                    {/* image of video thumbnail */}
                    {fileInfo.filetype === "image" ? (
                        <img
                            className="media media-image"
                            src={`/uploads/${fileInfo.filename}`}
                            alt="an image"
                            loading="lazy"
                        />
                    ) : fileInfo.filetype === "video" ? (
                        <video className="media media-video" controls>
                            <source src={`/uploads/${fileInfo.filename}`} />
                        </video>
                    ) : (
                        <img
                            className="media "
                            src={`/error/error.png`}
                            alt="an image"
                            loading="lazy"
                        />
                    )}

                    {/* Loading Overlay */}
                    {isLoading && <LoadingOverlay />}

                    <div className="modal-details">
                        <h2>File Details:</h2>
                        <span className="modal-file-name">
                            <h4>File Name: </h4>
                            <p>{fileInfo.filename.substring(14)}</p>
                        </span>
                        <span>
                            <h4>Size: </h4>
                            <p>{fileInfo.filesize} KB</p>
                        </span>
                        <span>
                            <h4>Type: </h4>
                            <p>
                                {fileInfo.filetype == "image"
                                    ? "Image"
                                    : fileInfo.filetype == "video"
                                    ? "Video"
                                    : "Other"}{" "}
                            </p>
                        </span>
                    </div>
                </div>
                <div className="modal-data-bottom">
                    <section className="tag-container-wrapper">
                        <h1>Tags:</h1>
                        <div className="model-choose-run-container">
                            <div className="choose-model-options">
                                <p>Choose Model: </p>
                                {fileInfo.filetype == "image" ? (
                                    <select
                                        value={selectedModel}
                                        onChange={handleModelChange}
                                    >
                                        <option disabled value="">
                                            --Pick a Model--
                                        </option>
                                        <option value="vit">
                                            ViT (Faster)
                                        </option>
                                        {/* <option value="florenceOD">
                                    Florence 2 OD
                                </option> */}
                                        <option value="florenceDC">
                                            Florence 2 DC (Usually More
                                            Accurate)
                                        </option>
                                    </select>
                                ) : (
                                    <select
                                        value={selectedModel}
                                        onChange={handleModelChange}
                                    >
                                        <option disabled value="">
                                            --Pick a Model--
                                        </option>
                                        <option value="vivit">
                                            ViViT (Faster)
                                        </option>
                                        <option value="videoFlorenceDC">
                                            Florence 2 DC (More Accurate)
                                        </option>
                                    </select>
                                )}
                            </div>
                            {fileInfo.filetype == "other" ? (
                                <button
                                    className="analyze-button-disabled"
                                    disabled
                                >
                                    Cannot Analyze Tags
                                </button>
                            ) : (
                                <button
                                    key={isLoading ? "loading" : "normal"}
                                    onClick={handleAnalyze}
                                    disabled={isLoading}
                                    className="analyze-button"
                                >
                                    {isLoading
                                        ? "Loading..."
                                        : "✨ Analyze Tags"}
                                </button>
                            )}
                        </div>

                        <div className="tag-container">
                            {fileInfo.filetype == "image" ||
                            fileInfo.filetype == "video" ? (
                                tagsSet.length > 0 ? (
                                    tagsSet.map((tag, index) => (
                                        <Tag key={index} tagName={tag} />
                                    ))
                                ) : (
                                    <span className="no-tags">
                                        There are no tags yet. Pick a{" "}
                                        <span className="analyze-bold">
                                            Model
                                        </span>{" "}
                                        and click{" "}
                                        <span className="analyze-bold">
                                            Analyze Tags
                                        </span>{" "}
                                        to generate some tags.
                                    </span>
                                )
                            ) : (
                                <span className="no-tags">
                                    Cannot generate tags for{" "}
                                    <span className="analyze-bold">
                                        Unknown
                                    </span>{" "}
                                    File Type. Upload an{" "}
                                    <span className="analyze-bold">Image</span>{" "}
                                    or{" "}
                                    <span className="analyze-bold">Video</span>{" "}
                                    and try again.
                                </span>
                            )}
                        </div>
                    </section>
                    <section className="demographic-container-wrapper">
                        <h1>Demographics:</h1>
                        <div className="model-choose-run-container">
                            <div className="choose-model-options">
                                <p>Choose Model: </p>

                                <select
                                    value={selectedModel}
                                    onChange={handleModelChange}
                                >
                                    {/* <option disabled value="">
                                        --Pick a Model--
                                    </option> */}
                                    <option value="">
                                        Phi 4 Mini (Accurate)
                                    </option>
                                </select>
                            </div>
                            {tagsSet.length <= 0 ? (
                                <button
                                    className="analyze-button-disabled"
                                    disabled
                                >
                                    Generate Tags First
                                </button>
                            ) : (
                                <button
                                    key={isLoading ? "loading" : "normal"}
                                    onClick={handleAnalyzeDemographic}
                                    disabled={isLoading}
                                    className="analyze-button"
                                >
                                    {isLoading
                                        ? "Loading..."
                                        : "✨ Analyze Demographic"}
                                </button>
                            )}
                        </div>
                        <div className="demographic-container">
                            {tagsSet.length <= 0 ? (
                                <span className="no-tags">
                                    Cannot generate a demographic without{" "}
                                    <span className="analyze-bold">Tags.</span>{" "}
                                </span>
                            ) : demoRow.agerange != null ? (
                                <DemographicCard demoRow={demoRow} />
                            ) : (
                                <span className="no-tags">
                                    Pick a{" "}
                                    <span className="analyze-bold">Model</span>{" "}
                                    and click{" "}
                                    <span className="analyze-bold">
                                        Analyze Demographic
                                    </span>{" "}
                                    to generate a Demographic.
                                </span>
                            )}{" "}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default Modal;
