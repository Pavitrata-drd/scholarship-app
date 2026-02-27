import React from "react";
import "../styles/SplashScreen.css";

function SplashScreen({ isExiting }) {
  return (
    <div className={`splash-screen ${isExiting ? "splash-exit" : ""}`}>
      <div className="splash-card">
        <div className="splash-logo-wrap">
          <div className="spark-ring spark-ring-logo" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <svg className="splash-logo-mark" viewBox="0 0 220 240" aria-label="ScholarHub logo">
            <path d="M110 22L28 74H192L110 22Z" fill="#0a3b80" />
            <rect x="44" y="72" width="10" height="48" fill="#0a3b80" />
            <circle cx="49" cy="122" r="4" fill="#0a3b80" />
            <path d="M49 126C49 135 42 140 42 147C49 147 56 142 56 134C56 130 53 128 49 126Z" fill="#0a3b80" />

            <path d="M62 86C94 70 126 70 158 86V136C158 170 133 191 110 202C87 191 62 170 62 136V86Z" fill="#0a3b80" />
            <path d="M68 90C97 76 123 76 152 90V134C152 163 131 182 110 193C89 182 68 163 68 134V90Z" fill="#f2f4f8" />
            <path d="M84 152C86 166 95 178 110 187C125 178 134 166 136 152C126 162 117 165 110 165C103 165 94 162 84 152Z" fill="#0a3b80" />

            <path d="M67 191C56 184 44 179 34 174C42 188 52 199 65 206" fill="none" stroke="#8f95a3" strokeWidth="6" strokeLinecap="round" />
            <path d="M58 203C48 196 37 191 27 186" fill="none" stroke="#8f95a3" strokeWidth="6" strokeLinecap="round" />
            <path d="M153 191C164 184 176 179 186 174C178 188 168 199 155 206" fill="none" stroke="#8f95a3" strokeWidth="6" strokeLinecap="round" />
            <path d="M162 203C172 196 183 191 193 186" fill="none" stroke="#8f95a3" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>

        <div className="brand-wrap">
          <h1 className="splash-logo">ScholarHub</h1>
          <div className="spark-ring spark-ring-name" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="slogan-wrap">
        <p className="splash-subtitle">Welcome to our website</p>
          <div className="spark-ring spark-ring-slogan" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
