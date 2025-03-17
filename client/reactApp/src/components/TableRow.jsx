import React from "react";

import "./TableRow.css";
import { MdDelete } from "react-icons/md";
import { FaCheck, FaTimes, FaUserCheck, FaUserTimes } from "react-icons/fa";
import { FaImage, FaVideo } from "react-icons/fa6";

import { MdErrorOutline } from "react-icons/md";

const TableRow = ({ file, onModalClick, className, handleDeleteRow }) => {
    return (
        <tr key={file.id} className={className}>
            <td style={{ textAlign: "left", width: "540px" }}>
                {file.filename.substring(14)}
            </td>
            <td style={{ minWidth: "95px" }}>{file.filesize} KB</td>
            <td>
                {file.filetype == "image" ? (
                    <FaImage title="File is an Image" />
                ) : file.filetype == "video" ? (
                    <FaVideo title="File is a Video" />
                ) : (
                    <MdErrorOutline
                        title="File is of unknown type."
                        fontSize={"20px"}
                    />
                )}
            </td>

            <td>
                {file.tags == null ? (
                    <FaTimes fill="red" title="Tags have not been generated." />
                ) : (
                    <FaCheck fill="green" title="Tags have been generated." />
                )}
            </td>
            <td
                style={{
                    display: "flex",
                    columnGap: "10px",
                    justifyContent: "space-evenly",
                }}
            >
                <button
                    className="view-more-button"
                    onClick={() => onModalClick(file)}
                >
                    View More
                </button>

                <button
                    className="delete-row-button"
                    onClick={() => handleDeleteRow(file.id, file.filename)}
                    title="Delete this file"
                >
                    <MdDelete className="delete-icon" fontSize={"17px"} />
                </button>
            </td>
        </tr>
    );
};

export default TableRow;
