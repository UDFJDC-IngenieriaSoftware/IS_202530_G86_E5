/**
 * Migración: Crear tabla de notificaciones
 */
export function up(knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('type', 50).notNullable(); // 'group_invitation', 'modification_proposed', etc.
    table.string('title', 255).notNullable();
    table.text('message').nullable();
    table.json('data').nullable(); // Datos adicionales (group_id, invitation_id, etc.)
    table.boolean('read').defaultTo(false);
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['user_id', 'read']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('notifications');
}



