import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";

import oval_fringe_up from "@/asset/haircuts/oval/fringe_up.png";
import oval_pushed_back_long from "@/asset/haircuts/oval/pushed_back_long.png";
import oval_side_parted_short from "@/asset/haircuts/oval/side_parted_short.png";
import oval_undercut from "@/asset/haircuts/oval/undercut.png";

import round_faux_hawk_with_sorted_sides from "@/asset/haircuts/round/faux_hawk_with_sorted_sides.png";
import round_fringe_up from "@/asset/haircuts/round/fringe_up.png";
import round_quiff from "@/asset/haircuts/round/quiff.png";
import round_undercut from "@/asset/haircuts/round/undercut.png";

import square_crew_aka_buzz_cut from "@/asset/haircuts/square/crew_aka_buzz_cut.png";
import square_faux_hawk from "@/asset/haircuts/square/faux_hawk.png";
import square_slicked_back_side_part from "@/asset/haircuts/square/slicked_back_side_part.png";
import square_undercut from "@/asset/haircuts/square/undercut.png";

import triangular_fringe_up from "@/asset/haircuts/triangular/fringe_up.png";
import triangular_side_fringe from "@/asset/haircuts/triangular/side_fringe.png";
import triangular_side_parted from "@/asset/haircuts/triangular/side_parted.png";

import oblong_buzz_cut from "@/asset/haircuts/oblong/buzz_cut.png";
import oblong_fringe_up from "@/asset/haircuts/oblong/fringe_up.png";
import oblong_side_fringe from "@/asset/haircuts/oblong/side_fringe.png";
import oblong_side_parted from "@/asset/haircuts/oblong/side_parted.png";

import heart_long_fringes from "@/asset/haircuts/heart/long_fringes.png";
import heart_pushed_back from "@/asset/haircuts/heart/pushed_back.png";
import heart_side_parted_long from "@/asset/haircuts/heart/side_parted_long.png";
import heart_undercut from "@/asset/haircuts/heart/undercut.png";

import diamond_faux_hawk from "@/asset/haircuts/diamond/faux_hawk.png";
import diamond_long_hair_pulled_back from "@/asset/haircuts/diamond/long_hair_pulled_back.png";
import diamond_quiff from "@/asset/haircuts/diamond/quiff.png";
import diamond_side_fringe from "@/asset/haircuts/diamond/side_fringe.png";

import axios from "axios";

interface HaircutsImages {
    [key: string]: {
        [key: string]: StaticImageData;
    };
}

const HaircutsImages: HaircutsImages = {
    "oval": {
        "fringe_up": oval_fringe_up,
        "pushed_back_long": oval_pushed_back_long,
        "side_parted_short": oval_side_parted_short,
        "undercut": oval_undercut,
    },
    "round": {
        "faux_hawk_with_sorted_sides": round_faux_hawk_with_sorted_sides,
        "fringe_up": round_fringe_up,
        "quiff": round_quiff,
        "undercut": round_undercut,
    },
    "square": {
        "crew_aka_buzz_cut": square_crew_aka_buzz_cut,
        "faux_hawk": square_faux_hawk,
        "slicked_back_side_part": square_slicked_back_side_part,
        "undercut": square_undercut,
    },
    "triangular": {
        "fringe_up": triangular_fringe_up,
        "side_fringe": triangular_side_fringe,
        "side_parted": triangular_side_parted,
    },
    "oblong": {
        "buzz_cut": oblong_buzz_cut,
        "fringe_up": oblong_fringe_up,
        "side_fringe": oblong_side_fringe,
        "side_parted": oblong_side_parted,
    },
    "heart": {
        "long_fringes": heart_long_fringes,
        "pushed_back": heart_pushed_back,
        "side_parted_long": heart_side_parted_long,
        "undercut": heart_undercut,
    },
    "diamond": {
        "faux_hawk": diamond_faux_hawk,
        "long_hair_pulled_back": diamond_long_hair_pulled_back,
        "quiff": diamond_quiff,
        "side_fringe": diamond_side_fringe,
    },
}


interface HaircutChoicesProps {
    faceType: string;
    processedImage: string | null;
    faceOriginalImage: File | null;
}


const HaircutChoises = ({ faceType, processedImage, faceOriginalImage }: HaircutChoicesProps) => {
    const [haircutChoices, setHaircutChoices] = useState<string[]>([]);
    const [resultImage, setResultImage] = useState<string | null>(null);
    
    useEffect(() => {
        // Vérifiez si le type de visage est valide
        if (faceType in HaircutsImages) {
            setHaircutChoices(Object.keys(HaircutsImages[faceType]));
        } else {
            // Gérer un type de visage inconnu ou invalide
            console.error("Type de visage non reconnu:", faceType);
            setHaircutChoices([]); // Ou définissez une valeur par défaut
        }
    }, [faceType]);


    const handleTryOnPress = async (haircutFile: StaticImageData) => {

        const formData = new FormData();
        const haircutImageFile = new File([await fetch(haircutFile.src).then((res) => res.blob())], "haircut.jpg");

        formData.append("haircut_image", haircutImageFile);
        console.log(faceOriginalImage);
        if (!faceOriginalImage) {
            console.error("No image selected");
            return;
        }

        formData.append("face_image", faceOriginalImage);

        axios.post("http://127.0.0.1:5001/api/upload-haircut", formData, {
            responseType: 'blob'
        })
        .then((response) => {
            const blob = new Blob([response.data], { type: "image/png" });
            const filename = "result.png";
            setResultImage(URL.createObjectURL(blob));
        })
        .catch((error) => {
            console.error("Error uploading image:", error);
        });
    }
        
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-center mb-10 mt-10">Haircut Choices based on your face type: {faceType}</h1>
            <div className="flex flex-wrap justify-center">
                {haircutChoices.map((haircut) => {
                    console.log(HaircutsImages[faceType][haircut]);
                    return (
                        <div key={haircut} className="flex flex-col items-center m-5" onClick={() => handleTryOnPress(HaircutsImages[faceType][haircut])}>
                            <Image
                                src={HaircutsImages[faceType][haircut]}
                                alt={haircut.replace(/_/g, " ")}
                                width={160}
                                height={160}
                                className="rounded-full"
                            />
                            <p className="text-center text-lg font-bold">
                                {haircut.replace(/_/g, " ")}
                            </p>
                        </div>
                    );
                }
                )}
            </div>

            <h1 className="text-2xl font-bold text-center mb-10 mt-10">Try-on result</h1>
            {resultImage && (
                <Image
                    src={resultImage}
                    alt="Result"
                    width={500}
                    height={500}
                    className="rounded-full"
                />
            )}
        </div>
    );
};

export default HaircutChoises;
