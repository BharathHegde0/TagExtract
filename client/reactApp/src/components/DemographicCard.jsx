import React from "react";
import "./DemographicCard.css";

const DemographicCard = ({ demoRow }) => {
    return (
        <div className="demographic-card-container">
            <div className="demo-row">
                <div className="demo-heading">Age Group:</div>
                <div className="demo-content">{demoRow.agerange}</div>
            </div>
            <div className="demo-row">
                <div className="demo-heading">Gender:</div>
                <div className="demo-content">{demoRow.gender}</div>
            </div>
            <div className="demo-row">
                <div className="demo-heading">Lifestyle:</div>
                <div className="demo-content">{demoRow.lifestyle}</div>
            </div>
            <div className="demo-row">
                <div className="demo-heading">Interests:</div>
                <div className="demo-content">{demoRow.interests}</div>
            </div>
            <div className="demo-row">
                <div className="demo-heading">Income Level:</div>
                <div className="demo-content">{demoRow.income}</div>
            </div>
            <div className="demo-row">
                <div className="demo-heading">Location:</div>
                <div className="demo-content">{demoRow.loc}</div>
            </div>
        </div>
    );
};

export default DemographicCard;
