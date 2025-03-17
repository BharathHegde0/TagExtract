import React, { useEffect, useState } from "react";
import "./LoadingOverlay.css";

const LoadingOverlay = () => {
    const messages = [
        "Detecting Objects...",
        "Parsing Input...",
        "Locating Dense Region...",
        "Extracting Tags...",
        "Analyzing Pixels...",
        "Finding Hidden Details...",
        "Utilizing Neural Net...",
        "Aligning Transformers...",
        "Analyzing Image Textures...",
        "Finding Patterns...",
        "Performing AI Magic...",
        "Applying Vision Algorithm...",
        "Processing Metadata...",
    ];

    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="loading-overlay">
                {/* <div className="dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div> */}
                <div class="loader"></div>
                <p className="loading-message">{message}</p>
            </div>
        </>
    );
};

export default LoadingOverlay;
