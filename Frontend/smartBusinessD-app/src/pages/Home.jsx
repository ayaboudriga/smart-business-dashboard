import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          Smart Business
        </div>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login" className="login-button">
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">

          <h1>
            Manage Your Business
            <span>Smarter</span>
          </h1>

          <p>
            Smart Business Dashboard helps you manage
            your products, sales, stock and customers
            from one simple platform.
          </p>

          <button className="start-btn">
            Get Started
          </button>

        </div>

        <div className="hero-card">
          <h3>Business Overview</h3>

          <div className="stat">
            <span>Total Sales</span>
            <strong>12,450 TND</strong>
          </div>

          <div className="stat">
            <span>Products</span>
            <strong>245</strong>
          </div>

          <div className="stat">
            <span>Customers</span>
            <strong>1,280</strong>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">

        <h2>Everything You Need</h2>

        <p className="section-description">
          Manage your business operations easily and
          make better decisions using your data.
        </p>

        <div className="feature-container">

          <div className="feature-card">
            <h3>📦 Stock Management</h3>
            <p>
              Track your products and monitor your
              available stock.
            </p>
          </div>

          <div className="feature-card">
            <h3>💰 Sales Management</h3>
            <p>
              Manage sales and follow your business
              revenue.
            </p>
          </div>

          <div className="feature-card">
            <h3>📊 Business Analytics</h3>
            <p>
              Analyze your business data and discover
              useful insights.
            </p>
          </div>

        </div>
      </section>

      {/* About */}
      <section className="about" id="about">
        <h2>Make Better Business Decisions</h2>

        <p>
          Smart Business Dashboard brings your business
          data together in one place, helping you understand
          your performance and improve your decisions.
        </p>

      </section>
      

      
    {/* Background Wave */}
    <section className="wave-section">
      <div className="bg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#5B21B6"
            d="M0,32L26.7,48C53.3,64,107,96,160,122.7C213.3,149,267,171,320,154.7C373.3,139,427,85,480,74.7C533.3,64,587,96,640,117.3C693.3,139,747,149,800,165.3C853.3,181,907,203,960,208C1013.3,213,1067,203,1120,170.7C1173.3,139,1227,85,1280,69.3C1333.3,53,1387,75,1413,85.3L1440,96L1440,320L0,320Z"
          />
        </svg>
      </div>
    </section>

    {/* Footer */}
    <footer>
      <p>© 2026 Smart Business Dashboard</p>
    </footer>
  
    </div>
    
  );
}

export default Home;