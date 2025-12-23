/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user', table => {
    table.increments('id_user').primary();
    table.string('username', 50).unique().notNullable();
    table.string('password', 255).notNullable();
    table.enum('role', ['admin', 'guru', 'ortu']).notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user');
};
