/**
 * Migración: Crear tabla de miembros de grupos
 */
export function up(knex) {
  return knex.schema.createTable('group_members', (table) => {
    table.increments('id').primary();
    table.integer('group_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.string('role', 20).defaultTo('member'); // 'admin' o 'member'
    table.timestamps(true, true);
    
    table.foreign('group_id').references('id').inTable('groups').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.unique(['group_id', 'user_id']); // Un usuario solo puede estar una vez en un grupo
  });
}

export function down(knex) {
  return knex.schema.dropTable('group_members');
}



