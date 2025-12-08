/**
 * Migración: Crear tabla de modificaciones que requieren aprobación unánime
 */
export function up(knex) {
  return knex.schema.createTable('group_modifications', (table) => {
    table.increments('id').primary();
    table.integer('group_id').unsigned().notNullable();
    table.integer('proposer_id').unsigned().notNullable();
    table.string('modification_type', 50).notNullable(); // 'target_amount', 'name', 'description', etc.
    table.json('old_value').nullable();
    table.json('new_value').notNullable();
    table.string('status', 20).defaultTo('pending'); // 'pending', 'approved', 'rejected'
    table.timestamps(true, true);
    
    table.foreign('group_id').references('id').inTable('groups').onDelete('CASCADE');
    table.foreign('proposer_id').references('id').inTable('users').onDelete('CASCADE');
  });
}

export function down(knex) {
  return knex.schema.dropTable('group_modifications');
}


