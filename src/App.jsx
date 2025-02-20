import { useState } from "react";
import { useDropzone } from "react-dropzone";
import "./app.css";
import "./index.css";

export default function DeepfakeDetector() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null); 

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(URL.createObjectURL(file));
      setResult(""); 
      setApiResponse(null); 

      const formData = new FormData();
      formData.append("file", file);

      setLoading(true); 

      try {
        const response = await fetch("https://deepfake-fastapi-backend.azurewebsites.net/predict_deepfake", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        setApiResponse(data);

        if (data.description) {
          if (data.description.includes("Deepfake Detected.")) {
            setResult("Deepfake detected");
          } else if (data.description.includes("This is a real image")) {
            setResult("Image is real");
          } else {
            setResult(`Uncertain result: ${data.description}`);
          }
        } else {
          setResult("Unexpected API response.");
        }
      } catch (error) {
        setResult(`Error: ${error.message}`);
      }

      setLoading(false); 
    },
  });

  return (
    <div className="container">
      <h1 className="title">Deepfake Detector</h1>

      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & Drop an image or click to upload</p>
      </div>

      {image && (
        <div className="preview">
          <h2>Uploaded Image</h2>
          <img src={image} alt="Uploaded preview" className="uploaded-image" />
        </div>
      )}

      {loading && <p className="loading">Analyzing image...</p>}
      {result && <p className={`result ${result.includes("Deepfake") ? "fake" : "real"}`}>{result}</p>}

      {apiResponse && (
        <div className="result-box">
          <h2>API Response Details</h2>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
