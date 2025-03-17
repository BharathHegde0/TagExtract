import axios from "axios";
import React, { useEffect, useState } from "react";

import "./InputList.css";
import TableRow from "./TableRow";
import Modal from "./Modal";

const InputList = ({ files, fetchUpdatedFiles, handleDeleteRow }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedFile, setClickedFile] = useState(null);

    const onModalClick = (file) => {
        setClickedFile(file);
        setIsModalOpen(true);
    };

    return (
        <>
            {/* <h1 className='heading'>Input List</h1> */}
            <main class="table-wrapper" id="customers_table">
                <section class="table__body">
                    <table>
                        <thead cl>
                            <tr>
                                <th style={{ textAlign: "left" }}>File Name</th>
                                <th>Size</th>
                                <th>Type</th>
                                <th>Tags</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.length == 0 ? (
                                <tr>
                                    <td>
                                        There are no files.{" "}
                                        <span className="analyze-bold">
                                            Upload a file
                                        </span>{" "}
                                        to get started.
                                    </td>
                                </tr>
                            ) : (
                                files.map((file) => (
                                    <TableRow
                                        file={file}
                                        key={file.id}
                                        onModalClick={onModalClick}
                                        className={"fade-in-top"}
                                        handleDeleteRow={handleDeleteRow}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </section>
            </main>

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fileInfo={clickedFile}
                    fetchUpdatedFiles={fetchUpdatedFiles}
                    className={"fade-in-top"}
                />
            )}
        </>
    );
};

export default InputList;
