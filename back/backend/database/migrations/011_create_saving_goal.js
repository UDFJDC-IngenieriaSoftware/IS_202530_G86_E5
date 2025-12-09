/**
 * Migración para crear la tabla de metas de ahorro
 */
export const up = function (knex) {
  return knex.schema.createTable('saving_goals', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('group_id').unsigned().nullable();
    table.string('name', 255).notNullable();
    table.decimal('target_amount', 15, 2).notNullable();
    table.decimal('current_amount', 15, 2).defaultTo(0);
    table.enum('type', ['personal', 'group']).defaultTo('personal');
    table.text('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Relaciones
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('group_id').references('id').inTable('groups').onDelete('CASCADE');

    // Índices
    table.index('user_id');
    table.index('group_id');
    table.index('type');
  });
};

export const down = function (knex) {
  return knex.schema.dropTableIfExists('saving_goals');
};