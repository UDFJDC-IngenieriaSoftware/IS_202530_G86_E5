/**
 * Migración: Crear tabla de grupos
 */
export function up(knex) {
  return knex.schema.createTable('groups', (table) => {
    table.increments('id').primary();
    table.integer('creator_id').unsigned().notNullable();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.decimal('target_amount', 15, 2).nullable(); // Meta colectiva
    table.timestamps(true, true);
    
    table.foreign('creator_id').references('id').inTable('users').onDelete('CASCADE');
  });
}

export function down(knex) {
  return knex.schema.dropTable('groups');
}



