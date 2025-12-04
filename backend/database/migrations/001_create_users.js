/**
 * Migración: Crear tabla de usuarios
 */
export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.integer('login_attempts').defaultTo(0);
    table.timestamp('locked_until').nullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}



