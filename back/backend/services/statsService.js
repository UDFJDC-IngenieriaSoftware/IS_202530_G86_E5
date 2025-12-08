import db from '../config/database.js';

/**
 * Servicio de estadísticas financieras
 */
export class StatsService {
  /**
   * Obtiene resumen de transacciones por período
   */
  static async getSummary(userId, period = 'month') {
    let dateFilter;
    const now = new Date();

    switch (period) {
      case 'day':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = weekStart;
        break;
      case 'month':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        dateFilter = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await db('transactions')
      .where({ user_id: userId })
      .where('date', '>=', dateFilter.toISOString().split('T')[0])
      .select('type', 'amount', 'date');

    const summary = {
      period,
      startDate: dateFilter.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      data: [],
    };

    // Agrupar por fecha
    const grouped = {};
    transactions.forEach((t) => {
      // Manejar tanto objetos Date como strings
      const dateObj = t.date instanceof Date ? t.date : new Date(t.date);
      const date = dateObj.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        grouped[date].income += parseFloat(t.amount);
      } else {
        grouped[date].expense += parseFloat(t.amount);
      }
    });

    summary.data = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

    return summary;
  }

  /**
   * Obtiene totales acumulados
   */
  static async getTotals(userId) {
    const transactions = await db('transactions')
      .where({ user_id: userId })
      .select('type', 'amount');

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      const amount = parseFloat(t.amount);
      if (t.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  /**
   * Obtiene estadísticas por categoría
   */
  static async getByCategory(userId, period = 'month') {
    let dateFilter;
    const now = new Date();

    switch (period) {
      case 'month':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        dateFilter = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactions = await db('transactions')
      .where({ 'transactions.user_id': userId })
      .where('transactions.date', '>=', dateFilter.toISOString().split('T')[0])
      .join('categories', 'transactions.category_id', 'categories.id')
      .select(
        'categories.id',
        'categories.name',
        'categories.color',
        'transactions.type',
        'transactions.amount'
      );

    const grouped = {};
    transactions.forEach((t) => {
      const key = `${t.id}-${t.type}`;
      if (!grouped[key]) {
        grouped[key] = {
          categoryId: t.id,
          categoryName: t.name,
          color: t.color,
          type: t.type,
          amount: 0,
        };
      }
      grouped[key].amount += parseFloat(t.amount);
    });

    return Object.values(grouped);
  }
}

