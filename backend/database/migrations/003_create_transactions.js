/**
 * Migración: Crear tabla de transacciones
 */
export function up(knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('category_id').unsigned().notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.date('date').notNullable();
    table.string('description', 500).nullable();
    table.string('type', 20).notNullable(); // 'income' o 'expense'
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('category_id').references('id').inTable('categories').onDelete('RESTRICT');
    table.index(['user_id', 'date']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('transactions');
}



