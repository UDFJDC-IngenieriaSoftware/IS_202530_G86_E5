// backend/database/migrations/010_ownership_transaction.js
export async function up(knex) {
  // 1) agregar columnas
  await knex.schema.alterTable('transactions', (table) => {
    table.string('owner_type', 16).notNullable().defaultTo('user'); // 'user' | 'group'
    table.integer('owner_id').nullable(); // user -> user_id, group -> groups.id
  });

  // 2) backfill: asignar espacio por defecto = usuario dueño de la transacción
  await knex('transactions').update({
    owner_type: 'user',
    owner_id: knex.raw('user_id')
  });

  // 3) índice para búsquedas por espacio
  await knex.schema.alterTable('transactions', (table) => {
    table.index(['owner_type', 'owner_id'], 'transactions_owner_idx');
  });
};

export async function down(knex) {
  // Revertir cambios
  await knex.schema.alterTable('transactions', (table) => {
    table.dropIndex(['owner_type', 'owner_id'], 'transactions_owner_idx');
  });

  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('owner_id');
    table.dropColumn('owner_type');
  });
};
