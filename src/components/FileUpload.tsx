import React, { useState } from 'react'

const FileUpload: React.FC = () => {
    const [ selectedFile, setSelectedFile ] = useState<any>(null);
    const [ status, setStatus ] = useState("");
    const [ progress, setProgress ] = useState(0);

    const handleFileChange = (event: any) => {
        console.log(event.target);
        const file = event.target.files[0];
        setSelectedFile(file);
    }

    const handleUpload = () => {
        console.log(selectedFile)
        if (!selectedFile) {
            alert("Please select a file to upload");
            return;
        }

        const chunkSize = 1024 * 1024; // 1MB
        const totalChunks = Math.ceil(selectedFile.size / chunkSize);
        const chunkProcess = 100 / totalChunks;
        let chunkNumber = 0;
        let start = 0;
        let end = 0;

        const uploadNextChunk = async () => {
            console.log("start: ", start)
            console.log("end: ", end)
            console.log("Fize size: ", selectedFile.size)
            if (end <= selectedFile.size) {
                const chunk = selectedFile.slice(start, end);
                const formData = new FormData();
                formData.append("file", chunk);
                formData.append("chunkNumber", `${chunkNumber}`);
                formData.append("totalChunks", `${totalChunks}`);
                formData.append("originalFilename", selectedFile.name);

                fetch("https://talviruusu.com/upload", {
                    method: "POST",
                    body: formData,
                })
                    .then((response) => response.json)
                    .then(data => {
                        console.log({ data });
                        const temp = `Chunk ${
                            chunkNumber + 1
                        }/${totalChunks} uploaded successfully`;
                        setStatus(temp);
                        setProgress(Number((chunkNumber + 1) * chunkProcess));

                        console.log(temp);
                        chunkNumber++;
                        start = end;
                        end = start + chunkSize;
                        uploadNextChunk();
                    })
            } else {
                setProgress(100);
                setSelectedFile(null);
                setStatus("File upload completed");
            }
        }

        uploadNextChunk();
    }
    
    return (
        <div>
            <h2>Resumable File Upload</h2>
            <h3>{status}</h3>
            <div>Progress: {progress}</div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload File</button>
        </div>
    )
}

export default FileUpload;