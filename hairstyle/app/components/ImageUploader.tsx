import React, { useState, ChangeEvent, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import Placeholder from "@/asset/placeholder.png";
import Webcam from "react-webcam";
import { MoonLoader } from "react-spinners";

interface ImageUploaderProps {
  onImageUpload: (result: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [mode, setMode] = useState<"upload" | "webcam" | "video">("upload");

  const webcamRef = useRef<Webcam | null>(null);

  const capture = React.useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = (webcamRef.current as any).getScreenshot();
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const filename = "webcam.jpg";
    setSelectedImage(new File([blob], filename));
  }, [webcamRef]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedImage(file || null);
  };

  const handleUpload = () => {
    console.log(selectedImage);
    if (!selectedImage) {
      console.error("No image selected");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    axios
      .post("https://melius-capillus-9f332e274492.herokuapp.com/api/process-image", formData)
      .then((response) => {
        onImageUpload(response.data.result);
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  };

  return (
    <div>
      <div
        className="flex flex-col justify-center items-center mb-5"
        style={{ fontFamily: "Dancing Script" }}
      >
        <h2 className="text-3xl font-bold mb-5 text-center">
          Upload a picture of yourself
        </h2>
        <h3 className="text-xl mb-5 text-center">
          We&apos;ll find the best hairstyle for you!
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center w-full my-5 gap-3">
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
            mode === "upload" && "bg-blue-700"
          }`}
          onClick={() => setMode("upload")}
        >
          Upload
        </button>
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
            mode === "webcam" && "bg-blue-700"
          }`}
          onClick={() => setMode("webcam")}
        >
          Webcam
        </button>
      </div>
      <div className="flex flex-col justify-center items-center mb-5">
        {mode === "upload" && (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-center w-full my-5 gap-3">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              <Image
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : Placeholder
                }
                alt="Placeholder"
                className="object-contain"
                width={420}
                height={420}
              />
            </div>
          </>
        )}
        {mode === "webcam" && (
          <div className="flex flex-col items-center justify-center w-full my-5 gap-3 relative">
            <div className="flex flex-col sm:flex-row items-center justify-center w-full my-5 gap-3 absolute z-0 top-0">
              <MoonLoader color="#1a202c" loading={true} size={50} />
              <p className="text-xl">Webcam loading...</p>
            </div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={720}
              videoConstraints={videoConstraints}
              className="z-10"
            />
            <button
              onClick={capture}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Capture photo
            </button>
            <p className="text-xs text-gray-500 ">
              Webcam is not working? Try using the upload option instead.
            </p>
            <hr className="w-full bg-gray-700" />
            <div>
              <p className="text-xs text-gray-500">
                Preview:
              </p>
              <Image
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : Placeholder
                }
                alt="Placeholder"
                className="object-contain"
                width={420}
                height={420}
              />
            </div>
          </div>
        )}
        <hr className="w-full bg-gray-700 my-8" />

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleUpload}
        >
          Find my hairstyle!
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
