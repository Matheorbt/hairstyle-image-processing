"use client";
import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import ResultImage from "./components/ResultImage";

const App: React.FC = () => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handleImageUpload = (result: string) => {
    setProcessedImage(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ebf4f5] to-[#b5c6e0] flex flex-col justify-center items-center p-8">
      <h1
        className="text-5xl font-bold text-center mb-10"
        style={{ fontFamily: "Dancing Script" }}
      >Melius Capillus</h1>
      <ImageUploader onImageUpload={handleImageUpload} />
      {processedImage && <ResultImage />}
    </div>
  );
};

export default App;
