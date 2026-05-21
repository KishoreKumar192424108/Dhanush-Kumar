import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  CalendarClock,
  Database,
  FileSpreadsheet,
  Gauge,
  Home,
  LayoutDashboard,
  Moon,
  RefreshCw,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { ThemeContext } from '../App';

const palette = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0));

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div><Icon size={22} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ChartCard({ title, children, wide }) {
  return (
    <section className={wide ? 'chart-card wide' : 'chart-card'}>
      <h3>{title}</h3>
      <div className="chart-body">{children}</div>
    </section>
  );
}

function Heatmap({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="heatmap">
      {data.map((item, index) => (
        <div
          key={`${item.day}-${item.block}-${index}`}
          className="heat-cell"
          style={{ backgroundColor: `rgba(37, 99, 235, ${0.12 + (item.value / max) * 0.78})` }}
          title={`${item.day} ${item.block}: ${formatNumber(item.value)}`}
        >
          <span>{item.day}</span>
          <strong>{item.block}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { filename } = useParams();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [data, setData] = useState(null);
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/dashboard/${filename}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to load dashboard');
      setData(json);
      setTarget(json.target_column);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [filename]);

  const forecastCombo = useMemo(() => {
    if (!data) return [];
    const historical = data.charts.trend.slice(-20).map((item) => ({ date: item.date, actual: item.usage }));
    const forecast = data.charts.forecast.slice(0, 30).map((item) => ({ date: item.date, forecast: item.prediction }));
    return [...historical, ...forecast];
  }, [data]);

  const exportReport = (type) => {
    window.location.href = `/api/reports/${filename}/${type}`;
  };

  if (loading) {
    return <main className="dashboard loading-state"><RefreshCw className="spin" size={28} /> Loading mathematical analysis...</main>;
  }

  if (error) {
    return (
      <main className="dashboard loading-state">
        <p>{error}</p>
        <Link to="/upload" className="btn primary">Upload Dataset</Link>
      </main>
    );
  }

  const summary = data.summary;
  const dataset = data.dataset;

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <Link to="/" className="brand compact"><span className="brand-mark"><BarChart3 size={18} /></span> GasPredict</Link>
        <nav>
          <a className="active"><LayoutDashboard size={18} /> Dashboard</a>
          <Link to="/upload"><Database size={18} /> Upload</Link>
          <Link to="/admin"><Gauge size={18} /> Admin</Link>
          <Link to="/"><Home size={18} /> Home</Link>
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Prediction Dashboard</p>
            <h1>Gas Consumption Intelligence</h1>
            <span>{dataset.filename} · {dataset.rows_count} rows · Target: {target}</span>
          </div>
          <div className="header-actions">
            <button className="icon-button" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn secondary small" onClick={() => exportReport('excel')}><FileSpreadsheet size={16} /> Excel</button>
            <button className="btn primary small" onClick={() => exportReport('pdf')}><ArrowDownToLine size={16} /> PDF</button>
          </div>
        </header>

        <section className="metric-grid">
          <MetricCard icon={Activity} label="Total Gas Usage" value={formatNumber(summary.total_gas_usage)} tone="blue" />
          <MetricCard icon={Gauge} label="Average Consumption" value={formatNumber(summary.average_consumption)} tone="green" />
          <MetricCard icon={CalendarClock} label="Predicted Future Usage" value={formatNumber(summary.predicted_future_usage)} tone="amber" />
          <MetricCard icon={TrendingUp} label="Monthly Growth Rate" value={`${formatNumber(summary.monthly_growth_rate)}%`} tone="purple" />
        </section>

        <section className="insight-strip">
          <div><strong>{data.trend_analysis.equation}</strong><span>Linear regression equation</span></div>
          <div><strong>{data.trend_analysis.direction}</strong><span>Trend direction</span></div>
          <div><strong>{formatNumber(data.metrics.mae)}</strong><span>MAE</span></div>
          <div><strong>{formatNumber(data.metrics.rmse)}</strong><span>RMSE</span></div>
        </section>

        <section className="charts-grid">
          <ChartCard title="Line Chart · Gas Consumption Trend" wide>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={28} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="usage" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="movingAverage" stroke="#14b8a6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Bar Chart · Monthly Usage Comparison">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" minTickGap={16} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" radius={[6, 6, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Pie Chart · Seasonal Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.charts.seasonal} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                  {data.charts.seasonal.map((_, index) => <Cell key={index} fill={palette[index % palette.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Area Chart · Prediction Growth">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.forecast}>
                <defs>
                  <linearGradient id="predictionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" minTickGap={24} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="prediction" stroke="#14b8a6" fill="url(#predictionFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Heatmap · Usage Patterns">
            <Heatmap data={data.charts.heatmap} />
          </ChartCard>

          <ChartCard title="Forecast Graph · Actual vs Future Prediction" wide>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastCombo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={22} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Area type="monotone" dataKey="forecast" stroke="#f59e0b" fill="#fef3c7" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>
      </section>
    </main>
  );
}
