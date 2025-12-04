import db from '../config/database.js';

/**
 * Servicio de transacciones
 */
export class TransactionService {
  /**
   * Obtiene todas las transacciones de un usuario
   */
  static async getByUserId(userId, filters = {}) {
    let query = db('transactions')
      .where({ 'transactions.user_id': userId })
      .join('categories', 'transactions.category_id', 'categories.id')
      .select(
        'transactions.*',
        'categories.name as category_name',
        'categories.color as category_color'
      )
      .orderBy('transactions.date', 'desc')
      .orderBy('transactions.created_at', 'desc');

    if (filters.startDate) {
      query = query.where('transactions.date', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query = query.where('transactions.date', '<=', filters.endDate);
    }
    if (filters.type) {
      query = query.where('transactions.type', filters.type);
    }
    if (filters.categoryId) {
      query = query.where('transactions.category_id', filters.categoryId);
    }

    return query;
  }

  /**
   * Obtiene una transacción por ID
   */
  static async getById(id, userId) {
    const transaction = await db('transactions')
      .where({ id, user_id: userId })
      .join('categories', 'transactions.category_id', 'categories.id')
      .select(
        'transactions.*',
        'categories.name as category_name',
        'categories.color as category_color'
      )
      .first();

    if (!transaction) {
      throw new Error('Transacción no encontrada');
    }

    return transaction;
  }

  /**
   * Crea una nueva transacción
   */
  static async create(userId, data) {
    // Verificar que la categoría pertenece al usuario
    const category = await db('categories')
      .where({ id: data.category_id, user_id: userId })
      .first();

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    // Usar el tipo de la categoría si no se proporciona
    const type = data.type || category.type;

    const [transaction] = await db('transactions')
      .insert({
        user_id: userId,
        category_id: data.category_id,
        amount: data.amount,
        date: data.date,
        description: data.description || null,
        type,
      })
      .returning('*');

    return this.getById(transaction.id, userId);
  }

  /**
   * Actualiza una transacción
   */
  static async update(id, userId, data) {
    // Verificar que la transacción existe y pertenece al usuario
    await this.getById(id, userId);

    // Si se actualiza la categoría, verificar que pertenece al usuario
    if (data.category_id) {
      const category = await db('categories')
        .where({ id: data.category_id, user_id: userId })
        .first();

      if (!category) {
        throw new Error('Categoría no encontrada');
      }
    }

    await db('transactions')
      .where({ id, user_id: userId })
      .update(data);

    return this.getById(id, userId);
  }

  /**
   * Elimina una transacción
   */
  static async delete(id, userId) {
    const transaction = await this.getById(id, userId);
    await db('transactions').where({ id, user_id: userId }).delete();
    return transaction;
  }
}



