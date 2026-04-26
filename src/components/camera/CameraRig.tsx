import React from "react";
import { AbsoluteFill } from "remotion";

interface CameraRigProps {
  pan?: number;    // translateX
  tilt?: number;   // rotateX
  yaw?: number;    // rotateY
  children: React.ReactNode;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  pan = 0,
  tilt = 0,
  yaw = 0,
  children,
}) => {
  return (
    <AbsoluteFill style={{ perspective: "1000px" }}>
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          transform: `translateX(${pan}px) rotateX(${tilt}deg) rotateY(${yaw}deg)`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
