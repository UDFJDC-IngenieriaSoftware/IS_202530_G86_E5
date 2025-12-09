/**
 * Migración para crear la tabla de transacciones de metas de ahorro
 */
export const up = function (knex) {
  return knex.schema.createTable('saving_goal_transactions', (table) => {
    table.increments('id').primary();
    table.integer('saving_goal_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('description', 255).nullable();
    table.date('date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Relaciones
    table.foreign('saving_goal_id').references('id').inTable('saving_goals').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Índices
    table.index('saving_goal_id');
    table.index('user_id');
    table.index('date');
  });
};

export const down = function (knex) {
  return knex.schema.dropTableIfExists('saving_goal_transactions');
};