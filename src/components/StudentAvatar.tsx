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

  if (isFemale) {
    // Female Hijab Avatar (matches user uploaded media_1791053702885.png & media_1791053715270.png)
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${className}`}
      >
        {showCircle && (
          <circle
            cx="50"
            cy="50"
            r="47"
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-line-strong dark:text-line"
          />
        )}
        {/* Outer Hijab Veil / Shroud Silhouette */}
        <path
          d="M50 14 C35 14 24 28 22 52 C20 68 15 82 11 90 C34 94 66 94 89 90 C85 82 80 68 78 52 C76 28 65 14 50 14 Z"
          fill="currentColor"
          className="text-[#3c444a] dark:text-[#cad2d8]"
        />
        {/* Inner Face Opening (Cutout) */}
        <ellipse
          cx="50"
          cy="48"
          rx="14"
          ry="19"
          fill="#fbfaf7"
          className="dark:fill-[#1a231e]"
        />
        {/* Inner Hijab Forehead Band / Undercap */}
        <path
          d="M37 38 C42 34 58 34 63 38 C60 41 55 42 50 42 C45 42 40 41 37 38 Z"
          fill="currentColor"
          className="text-[#3c444a] dark:text-[#cad2d8]"
        />
      </svg>
    );
  }

  // Male Kufi / Topi & Kurta Avatar (matches user uploaded media_1791053702885.png)
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      {showCircle && (
        <circle
          cx="50"
          cy="50"
          r="47"
          stroke="currentColor"
          strokeWidth="3.5"
          className="text-line-strong dark:text-line"
        />
      )}
      {/* Islamic Topi / Kufi Cap */}
      <path
        d="M32 30 L50 21 L68 30 L66 40 C60 41 40 41 34 40 Z"
        fill="currentColor"
        className="text-[#3c444a] dark:text-[#cad2d8]"
      />
      {/* Face & Head Outline */}
      <path
        d="M35 39 C34 56 40 65 50 65 C60 65 66 56 65 39"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="#fbfaf7"
        className="text-[#3c444a] dark:text-[#cad2d8] dark:fill-[#1a231e]"
      />
      {/* Left Ear */}
      <path
        d="M34 43 C31 43 31 51 34 51"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        className="text-[#3c444a] dark:text-[#cad2d8]"
      />
      {/* Right Ear */}
      <path
        d="M66 43 C69 43 69 51 66 51"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        className="text-[#3c444a] dark:text-[#cad2d8]"
      />
      {/* Kurta Collar (Nehru / Mandarin Style) */}
      <path
        d="M44 65 L44 69 C44 71 47 73 50 73 C53 73 56 71 56 69 L56 65"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        className="text-[#3c444a] dark:text-[#cad2d8]"
      />
      {/* Kurta Shoulders Silhouette */}
      <path
        d="M42 71 C32 75 22 81 16 90 C38 94 62 94 84 90 C78 81 68 75 58 71"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="text-[#3c444a] dark:text-[#cad2d8]"
      />
      {/* Kurta Buttons */}
      <circle
        cx="50"
        cy="78"
        r="1.8"
        fill="currentColor"
        className="text-[#3c444a] dark:text-[#cad2d8]"
      />
      <circle
        cx="50"
        cy="86"
        r="1.8"
        fill="currentColor"
        className="text-[#3c444a] dark:text-[#cad2d8]"
      />
    </svg>
  );
}
