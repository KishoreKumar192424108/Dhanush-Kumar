from datetime import datetime, timedelta
from pathlib import Path
import json
import os
import uuid

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import mysql.connector
import numpy as np
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.holtwinters import ExponentialSmoothing

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"
REPORT_DIR = BASE_DIR / "reports"
HISTORY_FILE = REPORT_DIR / "prediction_history.json"
LOG_FILE = REPORT_DIR / "system_logs.json"
ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}

DATASET_DIR.mkdir(exist_ok=True)
REPORT_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
CORS(app)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def safe_filename(filename):
    stem, ext = os.path.splitext(filename)
    safe_stem = "".join(ch if ch.isalnum() or ch in ("-", "_") else "_" for ch in stem)
    return f"{safe_stem}_{uuid.uuid4().hex[:8]}{ext.lower()}"


def read_dataset(filename):
    path = DATASET_DIR / filename
    if not path.exists():
        raise FileNotFoundError("Dataset not found")
    if path.suffix.lower() == ".csv":
        return pd.read_csv(path)
    return pd.read_excel(path)


def write_dataset(df, filename):
    path = DATASET_DIR / filename
    if path.suffix.lower() == ".csv":
        df.to_csv(path, index=False)
    else:
        df.to_excel(path, index=False)
    return path


def json_ready(value):
    if pd.isna(value):
        return None
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, np.generic):
        return value.item()
    return value


def preview_payload(df, filename, extra=None):
    preview = df.head(8).map(json_ready).to_dict("records")
    payload = {
        "filename": filename,
        "rows_count": int(len(df)),
        "columns": df.columns.tolist(),
        "preview": preview,
        "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
        "date_columns": detect_date_columns(df),
    }
    if extra:
        payload.update(extra)
    return payload


def detect_date_columns(df):
    candidates = []
    for col in df.columns:
        if "date" in col.lower() or "time" in col.lower() or "month" in col.lower():
            parsed = pd.to_datetime(df[col].dropna().head(20), errors="coerce")
            if parsed.notna().mean() > 0.75:
                candidates.append(col)
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            continue
        sample = df[col].dropna().head(15)
        if not sample.empty:
            as_text = sample.astype(str)
            if not as_text.str.contains(r"\d{1,4}[-/]\d{1,2}", regex=True).mean() > 0.5:
                continue
            parsed = pd.to_datetime(sample, errors="coerce")
            if parsed.notna().mean() > 0.75:
                candidates.append(col)
    return list(dict.fromkeys(candidates))


def detect_target_column(df):
    numeric = df.select_dtypes(include=[np.number]).columns.tolist()
    preferred = [c for c in numeric if any(key in c.lower() for key in ["gas", "usage", "consumption", "volume"])]
    return (preferred or numeric or [None])[0]


def normalize_dataset(df):
    original_rows = len(df)
    original_missing = int(df.isna().sum().sum())
    original_duplicates = int(df.duplicated().sum())

    df = df.copy()
    df.columns = [str(col).strip().replace(" ", "_") for col in df.columns]
    date_columns = detect_date_columns(df)

    for col in date_columns:
        df[col] = pd.to_datetime(df[col], errors="coerce")

    if date_columns:
        df = df.dropna(subset=[date_columns[0]])

    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        df[col] = df[col].fillna(df[col].median())

    df = df.drop_duplicates()
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].fillna("Unknown")

    if date_columns:
        df = df.sort_values(date_columns[0])
        for col in date_columns:
            df[col] = df[col].dt.strftime("%Y-%m-%d")

    selected_features = [c for c in df.columns if c in date_columns or c in numeric_cols]
    return df.reset_index(drop=True), {
        "missing_values_removed": original_missing,
        "duplicates_removed": original_duplicates,
        "rows_removed": original_rows - len(df),
        "date_columns": date_columns,
        "selected_features": selected_features,
    }


def mysql_connection():
    if os.getenv("USE_MYSQL", "false").lower() != "true":
        return None
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=os.getenv("MYSQL_DATABASE", "gas_prediction"),
    )


def append_json(path, record):
    data = []
    if path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
    data.append(record)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def log_event(message, level="INFO"):
    record = {"level": level, "message": message, "created_at": datetime.utcnow().isoformat()}
    try:
        conn = mysql_connection()
        if conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO app_logs(level, message) VALUES(%s, %s)", (level, message))
            conn.commit()
            cur.close()
            conn.close()
            return
    except Exception:
        pass
    append_json(LOG_FILE, record)


def save_prediction(record):
    try:
        conn = mysql_connection()
        if conn:
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO prediction_history
                (dataset_filename, target_column, model_equation, daily_forecast, weekly_forecast, monthly_forecast)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    record["dataset_filename"],
                    record["target_column"],
                    record["equation"],
                    record["daily_forecast"],
                    record["weekly_forecast"],
                    record["monthly_forecast"],
                ),
            )
            conn.commit()
            cur.close()
            conn.close()
            return
    except Exception:
        pass
    append_json(HISTORY_FILE, record)


def time_axis(df):
    date_cols = detect_date_columns(df)
    if date_cols:
        dates = pd.to_datetime(df[date_cols[0]], errors="coerce")
        labels = dates.dt.strftime("%Y-%m-%d").fillna("Unknown").tolist()
        next_start = dates.dropna().max() if dates.notna().any() else datetime.today()
        return labels, next_start, date_cols[0]
    return [f"Day {i + 1}" for i in range(len(df))], datetime.today(), None


def build_analysis(df, target_column=None, periods=30):
    target = target_column or detect_target_column(df)
    if target is None or target not in df.columns:
        raise ValueError("A numeric gas usage column is required for prediction")

    y = pd.to_numeric(df[target], errors="coerce").interpolate().bfill().ffill().to_numpy(dtype=float)
    if len(y) < 4:
        raise ValueError("At least four valid data rows are required for mathematical prediction")

    labels, last_date, date_col = time_axis(df)
    x = np.arange(len(y)).reshape(-1, 1)
    split = max(2, int(len(y) * 0.8))
    model = LinearRegression()
    model.fit(x[:split], y[:split])
    test_x, test_y = x[split:], y[split:]
    test_pred = model.predict(test_x) if len(test_x) else model.predict(x)
    metric_y = test_y if len(test_y) else y

    future_x = np.arange(len(y), len(y) + periods).reshape(-1, 1)
    linear_forecast = np.maximum(model.predict(future_x), 0)

    try:
        smoothing_model = ExponentialSmoothing(y, trend="add", seasonal=None, initialization_method="estimated")
        smoothing_fit = smoothing_model.fit(optimized=True)
        smooth_forecast = np.maximum(smoothing_fit.forecast(periods), 0)
    except Exception:
        alpha = 0.35
        smoothed = [y[0]]
        for value in y[1:]:
            smoothed.append(alpha * value + (1 - alpha) * smoothed[-1])
        smooth_forecast = np.array([smoothed[-1]] * periods)

    forecast = (linear_forecast * 0.65) + (smooth_forecast * 0.35)
    moving_average = pd.Series(y).rolling(window=min(7, len(y)), min_periods=1).mean().to_numpy()

    future_labels = [
        (last_date + timedelta(days=i + 1)).strftime("%Y-%m-%d") if date_col else f"Day {len(y) + i + 1}"
        for i in range(periods)
    ]

    monthly_df = pd.DataFrame({"label": labels, "usage": y})
    if date_col:
        monthly_df["month"] = pd.to_datetime(monthly_df["label"]).dt.strftime("%b %Y")
    else:
        monthly_df["month"] = [f"Bucket {i // 7 + 1}" for i in range(len(y))]
    monthly = monthly_df.groupby("month", sort=False)["usage"].sum().reset_index()

    seasonal = pd.DataFrame({"label": labels, "usage": y})
    if date_col:
        dates = pd.to_datetime(seasonal["label"])
        seasonal["season"] = np.select(
            [dates.dt.month.isin([12, 1, 2]), dates.dt.month.isin([3, 4, 5]), dates.dt.month.isin([6, 7, 8])],
            ["Winter", "Spring", "Summer"],
            default="Autumn",
        )
    else:
        seasonal["season"] = ["Observed"] * len(y)
    seasonal_data = seasonal.groupby("season")["usage"].sum().reset_index().to_dict("records")

    heatmap = []
    if date_col:
        dates = pd.to_datetime(labels)
        for day in range(7):
            for block in range(4):
                mask = (dates.dayofweek == day) & ((dates.day - 1) // 8 == block)
                heatmap.append({"day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day], "block": f"W{block + 1}", "value": float(np.mean(y[mask])) if mask.any() else 0})
    else:
        for day in range(7):
            for block in range(4):
                idx = [i for i in range(len(y)) if i % 7 == day and (i // 7) % 4 == block]
                heatmap.append({"day": f"D{day + 1}", "block": f"W{block + 1}", "value": float(np.mean(y[idx])) if idx else 0})

    predicted_month_usage = float(np.sum(forecast[:30]))
    current_total = float(np.sum(y[-30:])) if len(y) >= 30 else float(np.sum(y))
    monthly_growth = ((predicted_month_usage - current_total) / current_total * 100) if current_total else 0

    return {
        "target_column": target,
        "metrics": {
            "mae": float(mean_absolute_error(metric_y, test_pred)),
            "rmse": float(np.sqrt(mean_squared_error(metric_y, test_pred))),
            "r2": float(r2_score(metric_y, test_pred)) if len(metric_y) > 1 else 1,
        },
        "trend_analysis": {
            "direction": "increasing" if model.coef_[0] > 0 else "decreasing",
            "strength": float(abs(model.coef_[0])),
            "equation": f"y = {model.coef_[0]:.4f}x + {model.intercept_:.4f}",
        },
        "summary": {
            "total_gas_usage": float(np.sum(y)),
            "average_consumption": float(np.mean(y)),
            "predicted_future_usage": float(forecast[0]),
            "monthly_growth_rate": float(monthly_growth),
            "daily_forecast": float(forecast[0]),
            "weekly_forecast": float(np.mean(forecast[:7])),
            "monthly_forecast": float(np.mean(forecast[:30])),
        },
        "charts": {
            "trend": [{"date": labels[i], "usage": float(y[i]), "movingAverage": float(moving_average[i])} for i in range(len(y))],
            "monthly": [{"month": row["month"], "usage": float(row["usage"])} for _, row in monthly.iterrows()],
            "seasonal": [{"name": row["season"], "value": float(row["usage"])} for row in seasonal_data],
            "forecast": [{"date": future_labels[i], "prediction": float(forecast[i]), "linear": float(linear_forecast[i]), "smoothing": float(smooth_forecast[i])} for i in range(periods)],
            "heatmap": heatmap,
        },
    }


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "Gas Usage Prediction API"})


@app.post("/api/auth/login")
def login():
    data = request.get_json() or {}
    return jsonify({"token": "demo-admin-token", "user": {"name": data.get("email", "admin@gas.ai"), "role": "Admin"}})


@app.post("/api/upload")
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["file"]
    if not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Upload a CSV, XLS, or XLSX dataset"}), 400

    filename = safe_filename(file.filename)
    file.save(DATASET_DIR / filename)
    df = read_dataset(filename)
    
    try:
        conn = mysql_connection()
        if conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO datasets (filename, original_filename, rows_count, columns_json) VALUES (%s, %s, %s, %s)",
                (filename, file.filename, int(len(df)), json.dumps(df.columns.tolist())),
            )
            conn.commit()
            cur.close()
            conn.close()
    except Exception:
        pass

    log_event(f"Uploaded dataset {filename}")
    return jsonify({"message": "File uploaded successfully", **preview_payload(df, filename)})


@app.post("/api/preprocess")
def preprocess_data():
    filename = (request.get_json() or {}).get("filename")
    if not filename:
        return jsonify({"error": "Filename is required"}), 400
    df = read_dataset(filename)
    cleaned, report = normalize_dataset(df)
    processed_filename = f"processed_{Path(filename).stem}.csv"
    write_dataset(cleaned, processed_filename)
    log_event(f"Preprocessed dataset {filename}")
    return jsonify({"message": "Dataset preprocessed successfully", "processed_filename": processed_filename, "preprocessing_report": report, **preview_payload(cleaned, processed_filename)})


@app.post("/api/predict")
def predict():
    data = request.get_json() or {}
    filename = data.get("filename")
    periods = int(data.get("forecast_periods", 30))
    if not filename:
        return jsonify({"error": "Filename is required"}), 400
    df = read_dataset(filename)
    analysis = build_analysis(df, data.get("target_column"), periods)
    record = {
        "dataset_filename": filename,
        "target_column": analysis["target_column"],
        "equation": analysis["trend_analysis"]["equation"],
        "daily_forecast": analysis["summary"]["daily_forecast"],
        "weekly_forecast": analysis["summary"]["weekly_forecast"],
        "monthly_forecast": analysis["summary"]["monthly_forecast"],
        "created_at": datetime.utcnow().isoformat(),
    }
    save_prediction(record)
    log_event(f"Prediction generated for {filename}")
    return jsonify({"message": "Prediction completed successfully", **analysis})


@app.get("/api/dashboard/<filename>")
def dashboard(filename):
    df = read_dataset(filename)
    cleaned, report = normalize_dataset(df)
    analysis = build_analysis(cleaned, detect_target_column(cleaned), 45)
    return jsonify({"dataset": preview_payload(cleaned, filename), "preprocessing_report": report, **analysis})


@app.get("/api/admin")
def admin():
    datasets = []
    for path in DATASET_DIR.glob("*"):
        if path.suffix.lower().replace(".", "") in ALLOWED_EXTENSIONS:
            datasets.append({"filename": path.name, "size_kb": round(path.stat().st_size / 1024, 2), "modified": datetime.fromtimestamp(path.stat().st_mtime).isoformat()})
    
    reports = [{"filename": p.name, "size_kb": round(p.stat().st_size / 1024, 2)} for p in REPORT_DIR.glob("*") if p.is_file() and p.suffix.lower() in [".pdf", ".xlsx", ".xls"]]
    
    logs = []
    history = []
    
    try:
        conn = mysql_connection()
        if conn:
            cur = conn.cursor(dictionary=True)
            cur.execute("SELECT level, message, created_at FROM app_logs ORDER BY id DESC LIMIT 20")
            logs = cur.fetchall()
            for log in logs:
                if isinstance(log.get("created_at"), datetime):
                    log["created_at"] = log["created_at"].isoformat()
            
            cur.execute("SELECT dataset_filename, target_column, model_equation AS equation, daily_forecast, weekly_forecast, monthly_forecast, created_at FROM prediction_history ORDER BY id DESC LIMIT 20")
            history = cur.fetchall()
            for hist in history:
                if isinstance(hist.get("created_at"), datetime):
                    hist["created_at"] = hist["created_at"].isoformat()
            
            cur.close()
            conn.close()
    except Exception:
        pass

    if not logs:
        try:
            logs = json.loads(LOG_FILE.read_text(encoding="utf-8")) if LOG_FILE.exists() else []
        except Exception:
            logs = []
            
    if not history:
        try:
            history = json.loads(HISTORY_FILE.read_text(encoding="utf-8")) if HISTORY_FILE.exists() else []
        except Exception:
            history = []
            
    return jsonify({"datasets": datasets, "reports": reports, "logs": logs[-20:], "history": history[-20:]})


@app.delete("/api/admin/reports/<filename>")
def delete_report(filename):
    path = REPORT_DIR / filename
    if path.suffix.lower() not in [".pdf", ".xlsx", ".xls"]:
        return jsonify({"error": "Unauthorized file type"}), 400
    
    if path.exists() and path.is_file():
        path.unlink()
        
        try:
            conn = mysql_connection()
            if conn:
                cur = conn.cursor()
                cur.execute("DELETE FROM reports WHERE filename = %s", (filename,))
                conn.commit()
                cur.close()
                conn.close()
        except Exception:
            pass
            
        log_event(f"Deleted report {filename}")
        return jsonify({"message": "Report deleted"})
    return jsonify({"error": "Report not found"}), 404


@app.get("/api/reports/<filename>/<report_type>")
def export_report(filename, report_type):
    df = read_dataset(filename)
    cleaned, _ = normalize_dataset(df)
    analysis = build_analysis(cleaned, detect_target_column(cleaned), 30)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if report_type == "excel":
        report_path = REPORT_DIR / f"gas_prediction_report_{stamp}.xlsx"
        with pd.ExcelWriter(report_path, engine="openpyxl") as writer:
            cleaned.to_excel(writer, sheet_name="Cleaned Data", index=False)
            pd.DataFrame(analysis["charts"]["forecast"]).to_excel(writer, sheet_name="Forecast", index=False)
            pd.DataFrame([analysis["summary"]]).to_excel(writer, sheet_name="Summary", index=False)
        log_event(f"Exported Excel report {report_path.name}")
    else:
        report_path = REPORT_DIR / f"gas_prediction_report_{stamp}.pdf"
        styles = getSampleStyleSheet()
        doc = SimpleDocTemplate(str(report_path), pagesize=A4)
        story = [
            Paragraph("Gas Usage Prediction System using Mathematical Analysis", styles["Title"]),
            Spacer(1, 14),
            Paragraph(f"Dataset: {filename}", styles["Normal"]),
            Paragraph(f"Target column: {analysis['target_column']}", styles["Normal"]),
            Paragraph(f"Linear regression equation: {analysis['trend_analysis']['equation']}", styles["Normal"]),
            Spacer(1, 14),
        ]
        rows = [["Metric", "Value"]] + [[k.replace("_", " ").title(), f"{v:.2f}"] for k, v in analysis["summary"].items()]
        table = Table(rows, colWidths=[220, 180])
        table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")), ("PADDING", (0, 0), (-1, -1), 8)]))
        story.append(table)
        story.append(Spacer(1, 14))
        story.append(Paragraph("Forecast generated using linear regression, moving average, exponential smoothing, and trend analysis.", styles["BodyText"]))
        doc.build(story)
        log_event(f"Exported PDF report {report_path.name}")

    try:
        conn = mysql_connection()
        if conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO reports (filename, report_type) VALUES (%s, %s)",
                (report_path.name, report_type),
            )
            conn.commit()
            cur.close()
            conn.close()
    except Exception:
        pass

    return send_file(report_path, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
