# Gas Usage Prediction System using Mathematical Analysis

Full-stack software-only project for uploading gas usage datasets, preprocessing them, applying mathematical forecasting, and displaying results in a modern analytics dashboard.

## Stack

- Frontend: React.js, Recharts, Framer Motion, Tailwind-ready styling
- Backend: Python Flask
- Mathematical analysis: Pandas, NumPy, Scikit-learn, Statsmodels
- Database: MySQL-ready schema and connector, with local JSON fallback for demo history/logs
- Reports: PDF and Excel export

## Run

```powershell
venv\Scripts\python.exe backend\app.py
npm run dev
```

Open `http://127.0.0.1:5173`.

## Demo Dataset

Use `dataset/sample_gas_usage.csv` or click **View Demo** on the landing page.

## MySQL Setup

1. Create the database with `backend/schema.sql`.
2. Copy `.env.example` to `.env`.
3. Set `USE_MYSQL=true` and fill your MySQL credentials.

If MySQL is not enabled, uploads and reports still work, while logs/history are saved under `reports/`.
