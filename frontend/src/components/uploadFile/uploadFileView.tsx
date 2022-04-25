import React from "react";
import style from "./uploadFile.module.scss";
import icon from "assets/uploadIcon.svg";

interface UploadFileViewProps {
    active: boolean;
    onDrop: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onFileInputChange: (e: React.ChangeEvent) => void;
}

export const UploadFileView = ({
    active,
    onDrop,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onFileInputChange,
}: UploadFileViewProps) => {
    return (
        <div className={style.uploadContainer}>
            <p className={style.title}>Upload file</p>
            <p className={style.info}>Drag or choose your file upload</p>
            <label
                htmlFor="fileInput"
                className={active ? `${style.dropArea} ${style.active}` : `${style.dropArea}`}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                <input
                    type="file"
                    className={style.fileInput}
                    id="fileInput"
                    accept=".png, .webp, .gif, .mp3, .mp4"
                    onChange={onFileInputChange}
                />

                <img src={icon} alt="upload icon" />
                <p>PNG, GIF, WEBP, MP4 or MP3. Max 1 Gb.</p>
            </label>
        </div>
    );
};