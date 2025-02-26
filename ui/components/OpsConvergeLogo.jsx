import React from 'react';

const OpsConvergeLogo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="150"
      height="100"
      viewBox="0 0 150 100"
      fill="none"
    >
      {/* Converging Arrows */}
      <g transform="translate(50, 50)">
        <path
          d="M0 -30 L20 0 L0 30 Z"
          fill="#0074D9"
          transform="rotate(-45)"
        />
        <path
          d="M0 -30 L20 0 L0 30 Z"
          fill="#0074D9"
          transform="rotate(45)"
        />
      </g>

      {/* Text */}
      <text
        x="75"
        y="85"
        fontSize="16"
        fontWeight="bold"
        textAnchor="middle"
        fill="#6C757D"
      >
        OpsConverge
      </text>
    </svg>
  );
};

export default OpsConvergeLogo;