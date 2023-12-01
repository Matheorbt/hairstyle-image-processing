import { useEffect, useState } from "react";

const ResultImage = () => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/api/get-result-image")
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageSrc(url as any);
      })
      .catch((error) => {
        console.error("Error fetching result image:", error);
      });
  }, []);

  return <div>{imageSrc && <img src={imageSrc} alt="Processed Result" />}</div>;
};

export default ResultImage;
