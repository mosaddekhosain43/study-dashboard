"use client";

import React from "react";

interface StudentAvatarProps {
  gender?: "male" | "female" | string | null;
  className?: string;
  size?: number;
  showCircle?: boolean;
}

export default function StudentAvatar({
  gender = "male",
  className = "",
  size = 56,
  showCircle = false,
}: StudentAvatarProps) {
  const isFemale = gender?.toLowerCase() === "female";
  const src = isFemale ? "/avatars/female.png" : "/avatars/male.png";
  const alt = isFemale ? "Female Islamic Student Avatar" : "Male Islamic Student Avatar";

  return (
    <div
      className={`relative inline-grid place-items-center rounded-full overflow-hidden shrink-0 select-none bg-white shadow-xs ${
        showCircle ? "ring-2 ring-line" : "ring-1 ring-black/5"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-contain pointer-events-none"
        loading="eager"
      />
    </div>
  );
}

