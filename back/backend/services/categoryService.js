import db from '../config/database.js';

/**
 * Servicio de categorías
 */
export class CategoryService {
  /**
   * Obtiene todas las categorías de un usuario
   */
  static async getByUserId(userId, type = null) {
    let query = db('categories').where({ user_id: userId });

    if (type) {
      query = query.where({ type });
    }

    return query.orderBy('name', 'asc');
  }

  /**
   * Obtiene una categoría por ID
   */
  static async getById(id, userId) {
    const category = await db('categories')
      .where({ id, user_id: userId })
      .first();

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    return category;
  }

  /**
   * Crea una nueva categoría
   */
  static async create(userId, data) {
    // Verificar que no existe otra categoría con el mismo nombre y tipo
    const existing = await db('categories')
      .where({
        user_id: userId,
        name: data.name,
        type: data.type,
      })
      .first();

    if (existing) {
      throw new Error('Ya existe una categoría con ese nombre y tipo');
    }

    const [category] = await db('categories')
      .insert({
        user_id: userId,
        name: data.name,
        type: data.type,
        color: data.color || '#3B82F6',
      })
      .returning('*');

    return category;
  }

  /**
   * Actualiza una categoría
   */
  static async update(id, userId, data) {
    await this.getById(id, userId);

    // Si se actualiza el nombre o tipo, verificar que no existe duplicado
    if (data.name || data.type) {
      const category = await this.getById(id, userId);
      const name = data.name || category.name;
      const type = data.type || category.type;

      const existing = await db('categories')
        .where({
          user_id: userId,
          name,
          type,
        })
        .where('id', '!=', id)
        .first();

      if (existing) {
        throw new Error('Ya existe una categoría con ese nombre y tipo');
      }
    }

    await db('categories')
      .where({ id, user_id: userId })
      .update(data);

    return this.getById(id, userId);
  }

  /**
   * Elimina una categoría
   */
  static async delete(id, userId) {
    const category = await this.getById(id, userId);

    // Verificar que no hay transacciones usando esta categoría
    const transactions = await db('transactions')
      .where({ category_id: id })
      .first();

    if (transactions) {
      throw new Error('No se puede eliminar una categoría con transacciones asociadas');
    }

    await db('categories').where({ id, user_id: userId }).delete();
    return category;
  }
}


