"use client";
import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import ResultImage from "./components/ResultImage";
import Head from "next/head";
import Image from "next/image";
import QrCode from "@/asset/qr_code.svg"
import HaircutChoises from "./components/HaircutChoises";

const App: React.FC = () => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [faceOriginalImage, setFaceOriginalImage] = useState<File | null>(null);
  const [faceType, setFaceType] = useState<string>("");

  const handleFaceTypeChange = (type: string) => {
    setFaceType(type);
  }

  const handleImageUpload = (result: string) => {
    setProcessedImage(result);
  };

  const handleFaceOriginalImageUpload = (result: File) => {
    setFaceOriginalImage(result);
  }

  console.log("faceOriginalImage", faceOriginalImage);

  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-[#ebf4f5] to-[#b5c6e0] flex flex-col justify-center items-center p-8">
        <Image alt="qrcode" src={QrCode} width={250} height={250} className="my-8" />
        <h1
          className="text-5xl font-bold text-center mb-10"
          style={{ fontFamily: "Dancing Script" }}
        >
          Melius Capillus
        </h1>
        <ImageUploader onImageUpload={handleImageUpload} handleFaceTypeChange={handleFaceTypeChange} handleFaceOriginalImageUpload={handleFaceOriginalImageUpload} />
        {processedImage && <ResultImage />}
        {faceOriginalImage && faceType && <HaircutChoises faceType={faceType} processedImage={processedImage} faceOriginalImage={faceOriginalImage} />}
      </div>
    </>
  );
};

export default App;
