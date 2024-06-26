"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const VideoSection = () => {
  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderTextRef = useRef(null);
  const [sliderText, setSliderText] = useState([
    "WINDOW TINTING",
    "PAINT PROTECTION",
    "VINYL WRAPPING",
  ]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSliderIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 4000);

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, []);

  return (
    <>
      <div className=" min-h-screen flex object-contain w-full select-none relative">
        <div className="  relative flex w-full   bg-transparent top-0 h-screen z-0">
          <video
            style={{
              objectFit: "cover",
              opacity: 0.4,
            }}
            width="100%"
            height="100%"
            autoPlay
            muted
            loop
            playsInline
            className=" z-0"
          >
            <source
              src="https://theohtv.s3.amazonaws.com/car-low-res.mp4"
              type="video/mp4"
            />
            {`Your browser does not support the video tag.`}
          </video>
        </div>
        <section className="absolute top-0 min-h-screen flex border-t border-black border-b w-full h-full justify-center items-center">
          <div>
            <h1
              className={`font-bold md:text-8xl max-w-[400px] mt-20 -ml-14 sm:-ml-20 w-[300px] text-6xl relative `}
            >
              {`EXPERT-LEVEL`}
              <br></br>
              <span ref={sliderTextRef} className="slider-text ">
                {sliderText[sliderIndex]}
              </span>
            </h1>
            <div className="slider-tabs flex justify-center gap-2 mt-6 mb-14">
              <span
                onClick={() => setSliderIndex(0)}
                className={sliderIndex === 0 ? `active-tab` : ""}
              ></span>
              <span
                onClick={() => setSliderIndex(1)}
                className={sliderIndex === 1 ? `active-tab` : ""}
              ></span>
              <span
                onClick={() => setSliderIndex(2)}
                className={sliderIndex === 2 ? `active-tab` : ""}
              ></span>
            </div>

            <Link href="/get-quote">
              <button className="bg-black text-white font-bold border border-white py-4 px-10 rounded-md  text-2xl hover:bg-[#181818] transition-all duration-100">
                {` Get A Free Quote`}
              </button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default VideoSection;
