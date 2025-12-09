import db from '../config/database.js';

export class SavingGoalService {
  /**
   * Obtiene todas las metas de ahorro del usuario
   */
  static async getAll(userId) {
    return await db('saving_goals')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
  }

  /**
   * Obtiene una meta de ahorro por ID
   */
  static async getById(id, userId) {
    return await db('saving_goals')
      .where({ id, user_id: userId })
      .first();
  }

  /**
   * Crea una nueva meta de ahorro
   */
  static async create(userId, { name, target_amount, type, group_id, description }) {
    if (!name || !target_amount) {
      throw new Error('Nombre y monto objetivo son requeridos');
    }

    if (type === 'group' && !group_id) {
      throw new Error('group_id es requerido para metas de grupo');
    }

    try {
      const result = await db('saving_goals').insert({
        user_id: userId,
        name,
        target_amount,
        type: type || 'personal',
        group_id: type === 'group' ? group_id : null,
        description,
        current_amount: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      const id = result[0].id || result[0];
      return await this.getById(id, userId);
    } catch (error) {
      console.error('Error creating saving goal:', error);
      throw error;
    }
  }

  /**
   * Actualiza una meta de ahorro
   */
  static async update(id, userId, { name, target_amount, description }) {
    const goal = await this.getById(id, userId);
    if (!goal) throw new Error('Meta de ahorro no encontrada');

    await db('saving_goals')
      .where({ id, user_id: userId })
      .update({
        name: name || goal.name,
        target_amount: target_amount || goal.target_amount,
        description: description !== undefined ? description : goal.description,
        updated_at: new Date(),
      });

    return await this.getById(id, userId);
  }

  /**
   * Elimina una meta de ahorro
   */
  static async delete(id, userId) {
    const goal = await this.getById(id, userId);
    if (!goal) throw new Error('Meta de ahorro no encontrada');

    await db('saving_goals').where({ id, user_id: userId }).delete();
    return { message: 'Meta de ahorro eliminada' };
  }

  /**
   * Agrega un aporte a la meta de ahorro
   */
  static async addTransaction(savingGoalId, userId, { amount, description, date }) {
    if (!amount || amount <= 0) {
      throw new Error('Monto debe ser mayor a 0');
    }

    const goal = await db('saving_goals').where('id', savingGoalId).first();
    if (!goal) throw new Error('Meta de ahorro no encontrada');

    try {
      const txResult = await db('saving_goal_transactions').insert({
        saving_goal_id: savingGoalId,
        user_id: userId,
        amount,
        description,
        date: date || new Date().toISOString().split('T')[0],
        created_at: new Date(),
      }).returning('id');

      const txId = txResult[0].id || txResult[0];

      // Actualizar monto actual
      const newCurrent = parseFloat(goal.current_amount) + parseFloat(amount);
      await db('saving_goals')
        .where('id', savingGoalId)
        .update({
          current_amount: newCurrent,
          updated_at: new Date(),
        });

      return await db('saving_goal_transactions').where('id', txId).first();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * Obtiene transacciones de una meta
   */
  static async getTransactions(savingGoalId, userId) {
    const goal = await db('saving_goals')
      .where({ id: savingGoalId, user_id: userId })
      .first();
    
    if (!goal) throw new Error('Meta de ahorro no encontrada');

    return await db('saving_goal_transactions')
      .where('saving_goal_id', savingGoalId)
      .orderBy('date', 'desc');
  }

  /**
   * Elimina una transacción de meta
   */
  static async deleteTransaction(transactionId, userId) {
    const tx = await db('saving_goal_transactions')
      .where('id', transactionId)
      .first();

    if (!tx) throw new Error('Transacción no encontrada');

    // Obtener la meta
    const goal = await db('saving_goals').where('id', tx.saving_goal_id).first();

    // Restar el monto
    const newCurrent = Math.max(0, parseFloat(goal.current_amount) - parseFloat(tx.amount));
    await db('saving_goals')
      .where('id', tx.saving_goal_id)
      .update({
        current_amount: newCurrent,
        updated_at: new Date(),
      });

    // Eliminar transacción
    await db('saving_goal_transactions').where('id', transactionId).delete();

    return { message: 'Transacción eliminada' };
  }
}

export default SavingGoalService;