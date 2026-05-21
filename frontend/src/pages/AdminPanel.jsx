import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, FileText, ScrollText, Trash2 } from 'lucide-react';

export default function AdminPanel() {
  const [data, setData] = useState({ datasets: [], reports: [], logs: [], history: [] });

  const load = async () => {
    const res = await fetch('/api/admin');
    setData(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const removeReport = async (filename) => {
    await fetch(`/api/admin/reports/${filename}`, { method: 'DELETE' });
    load();
  };

  return (
    <main className="admin-page">
      <header className="subnav">
        <Link to="/" className="back-link"><ArrowLeft size={18} /> Home</Link>
        <Link to="/upload" className="btn primary small">Upload Dataset</Link>
      </header>
      <section className="admin-hero">
        <p className="eyebrow">Admin Panel</p>
        <h1>Manage datasets, logs, reports, and prediction history</h1>
      </section>
      <section className="admin-grid">
        <div className="admin-card">
          <h2><Database size={20} /> Uploaded Datasets</h2>
          {data.datasets.map((item) => <p key={item.filename}><span>{item.filename}</span><strong>{item.size_kb} KB</strong></p>)}
        </div>
        <div className="admin-card">
          <h2><FileText size={20} /> Reports</h2>
          {data.reports.map((item) => (
            <p key={item.filename}><span>{item.filename}</span><button onClick={() => removeReport(item.filename)}><Trash2 size={15} /></button></p>
          ))}
        </div>
        <div className="admin-card">
          <h2><ScrollText size={20} /> Logs</h2>
          {data.logs.map((item, index) => <p key={index}><span>{item.message}</span><strong>{item.level}</strong></p>)}
        </div>
        <div className="admin-card">
          <h2><FileText size={20} /> Prediction History</h2>
          {data.history.map((item, index) => <p key={index}><span>{item.dataset_filename}</span><strong>{Number(item.monthly_forecast).toFixed(2)}</strong></p>)}
        </div>
      </section>
    </main>
  );
}
