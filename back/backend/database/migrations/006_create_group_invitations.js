/**
 * Migración: Crear tabla de invitaciones a grupos
 */
export function up(knex) {
  return knex.schema.createTable('group_invitations', (table) => {
    table.increments('id').primary();
    table.integer('group_id').unsigned().notNullable();
    table.integer('inviter_id').unsigned().notNullable();
    table.integer('invitee_id').unsigned().notNullable();
    table.string('status', 20).defaultTo('pending'); // 'pending', 'accepted', 'rejected'
    table.timestamps(true, true);
    
    table.foreign('group_id').references('id').inTable('groups').onDelete('CASCADE');
    table.foreign('inviter_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('invitee_id').references('id').inTable('users').onDelete('CASCADE');
    table.index(['invitee_id', 'status']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('group_invitations');
}


