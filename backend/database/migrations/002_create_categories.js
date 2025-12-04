/**
 * Migración: Crear tabla de categorías
 */
export function up(knex) {
  return knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('name', 255).notNullable();
    table.string('type', 20).notNullable(); // 'income' o 'expense'
    table.string('color', 7).defaultTo('#3B82F6'); // Color hexadecimal
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.unique(['user_id', 'name', 'type']); // Nombre único por usuario y tipo
  });
}

export function down(knex) {
  return knex.schema.dropTable('categories');
}



