import React, { useState, ChangeEvent } from "react";
import axios from "axios";

interface ImageUploaderProps {
  onImageUpload: (result: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedImage(file || null);
  };

  const handleUpload = () => {
    if (!selectedImage) {
      console.error("No image selected");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    axios
      .post("/api/process-image", formData)
      .then((response) => {
        onImageUpload(response.data.result);
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload Image</button>
    </div>
  );
};

export default ImageUploader;
