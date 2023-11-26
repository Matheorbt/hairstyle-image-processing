import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";

const App: React.FC = () => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handleImageUpload = (result: string) => {
    setProcessedImage(result);
  };

  return (
    <div>
      <h1>Face Detection Web App</h1>
      <ImageUploader onImageUpload={handleImageUpload} />
      {processedImage && <img src={processedImage} alt="Processed Result" />}
    </div>
  );
};

export default App;
