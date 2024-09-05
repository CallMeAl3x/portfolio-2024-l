"use client";
import { useEffect, useState } from "react";
import ThreeScene from "./(components)/ThreeScene";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div className="h-screen w-full relative">
        <ThreeScene
          key={isMobile ? "mobile" : "desktop"}
          threeText={
            isMobile ? "FrontEnd\n Developper" : "FrontEnd\n Developper"
          }
          xOffset={0}
          yOffset={5}
          font="Magilio"
          textSize={isMobile ? 16 : 16}
        />
        <ThreeScene
          key="name"
          threeText="ALEXANDRE BONEFONS"
          xOffset={0}
          yOffset={-40}
          textSize={8}
          font="Magilio"
        />
      </div>
    </>
  );
}
