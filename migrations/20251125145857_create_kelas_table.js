/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('kelas', table => {
    table.increments('id_kelas').primary();
    table.string('nama_kelas', 20).notNullable();
    table.string('wali_kelas', 100);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('kelas');
};
