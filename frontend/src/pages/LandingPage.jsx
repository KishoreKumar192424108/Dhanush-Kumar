import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Database,
  FileDown,
  Gauge,
  LineChart,
  Sparkles,
  UploadCloud,
  WandSparkles,
} from 'lucide-react';

const features = [
  { icon: UploadCloud, title: 'Dataset Upload', text: 'Import CSV or Excel gas consumption data with instant schema preview.' },
  { icon: WandSparkles, title: 'Data Cleaning', text: 'Remove duplicates, repair missing values, format dates, and select features.' },
  { icon: BrainCircuit, title: 'Mathematical Analysis', text: 'Use regression, moving averages, smoothing, and time-series trend analysis.' },
  { icon: Gauge, title: 'Prediction Engine', text: 'Estimate daily, weekly, and monthly future gas consumption.' },
  { icon: BarChart3, title: 'Dashboard Analytics', text: 'Explore Power BI-style cards, charts, heatmaps, and forecast graphs.' },
  { icon: FileDown, title: 'Report Generation', text: 'Export prediction summaries as PDF or Excel and retain history.' },
];

const steps = ['Upload Dataset', 'Preprocess', 'Analyze', 'Predict', 'Dashboard'];

export default function LandingPage() {
  return (
    <main className="landing">
      <nav className="nav">
        <Link to="/" className="brand">
          <span className="brand-mark"><LineChart size={22} /></span>
          GasPredict AI
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#about">About</a>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-media" aria-hidden="true">
          <div className="analytics-wall">
            <div className="mini-card tall"><span /> <strong>+18.4%</strong><small>Forecast lift</small></div>
            <div className="mini-chart">
              {[42, 61, 54, 78, 72, 96, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
            </div>
            <div className="mini-card"><span /> <strong>12.7k</strong><small>Total units</small></div>
            <div className="mini-line"><svg viewBox="0 0 240 90"><path d="M8 72 C35 54, 48 62, 70 42 S111 38, 132 50 S174 68, 202 24 S224 22, 236 12" /></svg></div>
          </div>
        </div>
        <motion.div className="hero-content" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
          <p className="eyebrow"><Sparkles size={16} /> Software-only mathematical forecasting platform</p>
          <h1>Gas Usage Prediction System using Mathematical Analysis</h1>
          <p className="hero-copy">
            Upload historical gas usage datasets, automatically clean and analyze them, then predict future consumption with regression,
            smoothing, moving averages, and time-series trend intelligence.
          </p>
          <div className="hero-actions">
            <Link to="/upload" className="btn primary"><UploadCloud size={18} /> Upload Dataset</Link>
            <Link to="/dashboard/sample_gas_usage.csv" className="btn secondary">View Demo <ArrowRight size={18} /></Link>
          </div>
        </motion.div>
      </section>

      <section id="features" className="section">
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2>Everything needed for clean prediction workflows</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article className="glass-card feature-card" key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <div className="icon-box"><Icon size={22} /></div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="workflow section">
        <div className="section-heading">
          <p className="eyebrow">How It Works</p>
          <h2>From dataset to executive dashboard</h2>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <motion.div className="step" key={step} initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="about" className="about section">
        <div>
          <p className="eyebrow">About Project</p>
          <h2>Mathematics makes gas demand visible before it happens</h2>
        </div>
        <p>
          The system converts historical usage into a clean numerical timeline, fits the relationship <strong>y = mx + c</strong>,
          compares it with moving average and exponential smoothing signals, and turns the result into practical daily, weekly,
          and monthly estimates. It is entirely software-based, so it works with existing datasets without hardware, sensors,
          IoT devices, or microcontrollers.
        </p>
      </section>

      <footer className="footer">
        <div>
          <strong>Gas Usage Prediction System</strong>
          <p>Mathematical analysis dashboard for software-only forecasting.</p>
        </div>
        <div>
          <span>Contact: admin@gaspredict.local</span>
          <span>Project: Full-stack React + Flask + MySQL</span>
          <span>Social: LinkedIn · GitHub · X</span>
        </div>
      </footer>
    </main>
  );
}
