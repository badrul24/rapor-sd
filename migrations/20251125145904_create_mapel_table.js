/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('mapel', table => {
    table.increments('id_mapel').primary();
    table.string('nama_mapel', 50).notNullable();
    table.integer('kkm').defaultTo(70);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('mapel');
};
