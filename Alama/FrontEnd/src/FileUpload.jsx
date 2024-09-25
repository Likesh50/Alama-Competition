import React, { useState } from "react";
import { storage } from "./firebase"; // Adjust path to your firebase.js
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore"; // Optional for Firestore
import { db } from "./firebase"; // Optional for Firestore

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) return;

    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressPercent);
      },
      (error) => {
        console.error("Upload failed:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setDownloadURL(url);

          // Optional: Save file metadata to Firestore
          addDoc(collection(db, "files"), {
            name: file.name,
            url,
          })
            .then(() => console.log("File metadata saved to Firestore"))
            .catch((err) => console.error("Error adding document: ", err));
        });
      }
    );
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <progress value={progress} max="100" />
      {downloadURL && <p>File uploaded! <a href={downloadURL}>Download here</a></p>}
    </div>
  );
};

export default FileUpload;
