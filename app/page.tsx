"use client";
import { useEffect, useState } from "react";
import ThreeScene from "./(components)/ThreeScene";
import Image from "next/image";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

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

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null; // or a loading spinner, etc.
  }

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
        {/* <ThreeTextTest /> */}
        {/* <Image
          src="/images/Navbar.png"
          alt="Navbar"
          width={677}
          height={67}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 -translate-y-[-30%]"
        /> */}
      </div>
    </>
  );
}
