import React from 'react';
import './AnimatedEye.css';

const AnimatedEye = ({ className = "w-4 h-4" }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`animated-eye ${className}`}
        >
            {/* Eye outline */}
            <path
                className="eye-outline"
                d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
            />

            {/* Iris circle */}
            <circle
                className="eye-iris"
                cx="12"
                cy="12"
                r="3"
            />

            {/* Pupil - moves left and right */}
            <circle
                className="eye-pupil"
                cx="12"
                cy="12"
                r="1.5"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
};

export default AnimatedEye;
