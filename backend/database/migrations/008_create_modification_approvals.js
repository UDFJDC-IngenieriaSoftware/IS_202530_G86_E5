/**
 * Migración: Crear tabla de aprobaciones de modificaciones
 */
export function up(knex) {
  return knex.schema.createTable('modification_approvals', (table) => {
    table.increments('id').primary();
    table.integer('modification_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.boolean('approved').defaultTo(false);
    table.timestamps(true, true);
    
    table.foreign('modification_id').references('id').inTable('group_modifications').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.unique(['modification_id', 'user_id']); // Un usuario solo puede aprobar una vez
  });
}

export function down(knex) {
  return knex.schema.dropTable('modification_approvals');
}



