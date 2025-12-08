import db from '../config/database.js';

/**
 * Servicio de transacciones
 */
export class TransactionService {

  /**
   * Obtiene todas las transacciones de un usuario dependiendo de su tipo
   */
  static async getByUserId(userId, filters = {}) {

    let query = db('transactions')
      .leftJoin('categories', 'transactions.category_id', 'categories.id')
      .select(
        'transactions.*',
        'categories.name as category_name',
        'categories.color as category_color'
      )
      .where((qb) => {
        qb.where('transactions.owner_type', 'user')
          .andWhere('transactions.owner_id', userId);
      })
      .orWhereIn(
        ['transactions.owner_type', 'transactions.owner_id'],
        db('group_members')
          .where('user_id', userId)
          .select(db.raw(`'group' as owner_type`), 'group_id')
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
    .leftJoin('categories', 'transactions.category_id', 'categories.id')
    .select(
      'transactions.*',
      'categories.name as category_name',
      'categories.color as category_color'
    )
    .where('transactions.id', id)
    .first();

  if (!transaction) {
    throw new Error('Transacción no encontrada');
  }

  if(transaction.owner_type === 'user' && transaction.owner_id !== userId) {
    throw new Error('No tienes permiso para ver esta transacción');
  }

  if(transaction.owner_type === 'group') {
    const member = await db('group_members')
      .where({ group_id: transaction.owner_id, user_id: userId })
      .first();

    if (!member) throw new Error('No tienes permiso para ver esta transacción');
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

    // ------------------------------------------------------
    // Determinar OWNER OBLIGATORIO
    // ------------------------------------------------------
    let owner_type = data.owner_type;
    let owner_id = data.owner_id;

    // Caso A → no envían nada (frontend)
    if (!owner_type || !owner_id) {
      owner_type = 'user';
      owner_id = userId;
    }

    // Caso B → individual
    if (owner_type === 'user') {
      owner_id = userId;
    }

    // Caso C → grupal
    if (owner_type === 'group') {
      // Validar que grupo exista
      const group = await db('groups')
        .where({ id: owner_id })
        .first();

      if (!group) throw new Error('Grupo no encontrado');

      // Validar que usuario sea miembro
      const member = await db('group_members')
        .where({ group_id: owner_id, user_id: userId })
        .first();

      if (!member) throw new Error('No perteneces al grupo');
    }

    // Usar el tipo de la categoría si no se proporciona
    const type = data.type || category.type;

    const [transaction] = await db('transactions')
      .insert({
        user_id: userId,
        owner_type,
        owner_id,
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

     // Validación de owner en actualización
    if (data.owner_type || data.owner_id) {
      let owner_type = data.owner_type;
      let owner_id = data.owner_id;

      if (!owner_type || !owner_id) {
        throw new Error('owner_type y owner_id son obligatorios');
      }

      if (owner_type === 'user') {
        data.owner_id = userId;
      }

      if (owner_type === 'group') {
        const group = await db('groups')
          .where({ id: owner_id })
          .first();

        if (!group) throw new Error('Grupo no encontrado');

        const member = await db('group_members')
          .where({ group_id: owner_id, user_id: userId })
          .first();

        if (!member) throw new Error('No perteneces al grupo');
      }
    }

    await db('transactions')
      .where({ 'transactions.id': id })
      .update(data);

    return this.getById(id, userId);
  }

  /**
   * Elimina una transacción
   */
    static async delete(id, userId) {
    const transaction = await this.getById(id, userId);

    await db('transactions')
      .where({ 'transactions.id': id })
      .delete();

    return transaction;
  }
}


