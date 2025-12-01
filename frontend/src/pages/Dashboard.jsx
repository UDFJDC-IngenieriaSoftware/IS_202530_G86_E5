import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService.js';
import { getSocket } from '../config/socket.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Página del Dashboard financiero
 */
export const Dashboard = () => {
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [summary, setSummary] = useState({ data: [] });
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Configurar Socket.IO para actualizaciones en tiempo real
    const socket = getSocket();
    
    socket.on('transaction:created', () => {
      loadData();
    });

    socket.on('transaction:updated', () => {
      loadData();
    });

    socket.on('transaction:deleted', () => {
      loadData();
    });

    return () => {
      socket.off('transaction:created');
      socket.off('transaction:updated');
      socket.off('transaction:deleted');
    };
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [totalsData, summaryData] = await Promise.all([
        statsService.getTotals(),
        statsService.getSummary(period),
      ]);
      setTotals(totalsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráfico de líneas
  const lineChartData = {
    labels: summary.data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Ingresos',
        data: summary.data.map((item) => item.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Gastos',
        data: summary.data.map((item) => item.expense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Preparar datos para gráfico de dona
  const doughnutChartData = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        data: [totals.totalIncome, totals.totalExpense],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard Financiero</h1>

      {/* Selector de período */}
      <div className="period-selector">
        <button
          className={period === 'day' ? 'active' : ''}
          onClick={() => setPeriod('day')}
        >
          Día
        </button>
        <button
          className={period === 'week' ? 'active' : ''}
          onClick={() => setPeriod('week')}
        >
          Semana
        </button>
        <button
          className={period === 'month' ? 'active' : ''}
          onClick={() => setPeriod('month')}
        >
          Mes
        </button>
        <button
          className={period === 'year' ? 'active' : ''}
          onClick={() => setPeriod('year')}
        >
          Año
        </button>
      </div>

      {/* Totales */}
      <div className="totals-grid">
        <div className="total-card income">
          <h3>Total Ingresos</h3>
          <p className="amount positive">
            ${totals.totalIncome.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="total-card expense">
          <h3>Total Gastos</h3>
          <p className="amount negative">
            ${totals.totalExpense.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="total-card balance">
          <h3>Balance</h3>
          <p
            className={`amount ${
              totals.balance >= 0 ? 'positive' : 'negative'
            }`}
          >
            ${totals.balance.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Ingresos vs Gastos ({period})</h3>
          {summary.data.length > 0 ? (
            <Line data={lineChartData} options={{ responsive: true }} />
          ) : (
            <p className="no-data">No hay datos para mostrar</p>
          )}
        </div>
        <div className="chart-card">
          <h3>Distribución</h3>
          {totals.totalIncome > 0 || totals.totalExpense > 0 ? (
            <Doughnut data={doughnutChartData} options={{ responsive: true }} />
          ) : (
            <p className="no-data">No hay datos para mostrar</p>
          )}
        </div>
      </div>
    </div>
  );
};


