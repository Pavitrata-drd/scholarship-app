import React from "react";
import "../styles/Home.css";

function Home() {
  return (
    <section className="home">
      <div className="home-content">
        <h1>
          Find Your Perfect <br />
          <span>Scholarship</span>
        </h1>

        <p>
          Discover thousands of scholarship opportunities tailored to your
          profile. Let us help you achieve your educational dreams without
          financial barriers.
        </p>

        <div className="buttons">
          <button className="primary-btn">Explore Scholarships</button>
          <button className="secondary-btn">Ask AI Assistant</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat-box">🏆 5000+ Scholarships</div>
        <div className="stat-box">💰 $50M+ Awarded</div>
        <div className="stat-box">🎓 10K+ Students Helped</div>
      </div>

      {/* Background bubbles */}
      <div className="bubble b1"></div>
      <div className="bubble b2"></div>
      <div className="bubble b3"></div>
      <div className="bubble b4"></div>
      <div className="bubble b5"></div>
    </section>
  );
}

export default Home;
