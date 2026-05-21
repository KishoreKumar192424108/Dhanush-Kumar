import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Database, FileSpreadsheet, Loader2, UploadCloud, X } from 'lucide-react';

const API = '/api';

async function readApiResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(response.ok ? 'Server returned an invalid response' : `Server error ${response.status}: ${text.slice(0, 120) || 'empty response'}`);
  }
}

export default function UploadDataset() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const chooseFile = useCallback((nextFile) => {
    setFile(nextFile);
    setPreview(null);
    setStatus('');
    setError('');
  }, []);

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setStatus('Uploading dataset...');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: form });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setPreview(data);
      setStatus('Upload complete. Running preprocessing...');

      const pre = await fetch(`${API}/preprocess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: data.filename }),
      });
      const preData = await readApiResponse(pre);
      if (!pre.ok) throw new Error(preData.error || 'Preprocessing failed');
      setPreview(preData);
      setStatus('Dataset cleaned and ready. Opening dashboard...');
      setTimeout(() => navigate(`/dashboard/${preData.processed_filename}`), 900);
    } catch (err) {
      setError(err.message.includes('Failed to fetch') ? 'Backend API is not running. Start Flask on http://127.0.0.1:5000 and try again.' : err.message);
      setStatus('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="upload-page">
      <header className="subnav">
        <Link to="/" className="back-link"><ArrowLeft size={18} /> Home</Link>
        <Link to="/dashboard/sample_gas_usage.csv" className="btn secondary small">View Demo</Link>
      </header>

      <section className="upload-shell">
        <motion.div className="upload-intro" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">Dataset Upload Module</p>
          <h1>Upload gas usage data and let the pipeline prepare it</h1>
          <p>
            CSV, XLS, and XLSX files are accepted. The backend previews columns, removes duplicates, handles missing values,
            formats dates, selects numerical features, and opens the prediction dashboard.
          </p>
        </motion.div>

        <motion.div className="upload-panel glass-card" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label
            className="dropzone"
            onDrop={(event) => {
              event.preventDefault();
              chooseFile(event.dataTransfer.files?.[0]);
            }}
            onDragOver={(event) => event.preventDefault()}
          >
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(event) => chooseFile(event.target.files?.[0])} />
            <UploadCloud size={42} />
            <strong>{file ? file.name : 'Drop dataset here or browse'}</strong>
            <span>CSV, XLS, XLSX up to your browser limit</span>
          </label>

          {file && (
            <div className="file-chip">
              <FileSpreadsheet size={18} />
              <span>{file.name}</span>
              <button onClick={() => chooseFile(null)} aria-label="Remove file"><X size={16} /></button>
            </div>
          )}

          <button className="btn primary wide" disabled={!file || busy} onClick={upload}>
            {busy ? <Loader2 className="spin" size={18} /> : <Database size={18} />}
            {busy ? 'Processing...' : 'Upload and Analyze'}
          </button>

          {status && <div className="notice success"><CheckCircle2 size={18} /> {status}</div>}
          {error && <div className="notice error">{error}</div>}
        </motion.div>
      </section>

      {preview && (
        <section className="preview-section glass-card">
          <div className="preview-header">
            <div>
              <p className="eyebrow">File Preview</p>
              <h2>{preview.filename}</h2>
            </div>
            <div className="preview-meta">
              <span>{preview.rows_count} rows</span>
              <span>{preview.columns.length} columns</span>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>{preview.columns.map((column) => <th key={column}>{column}</th>)}</tr>
              </thead>
              <tbody>
                {preview.preview.map((row, rowIndex) => (
                  <tr key={rowIndex}>{preview.columns.map((column) => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
