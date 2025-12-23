/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('nilai', table => {
    table.increments('id_nilai').primary();
    table.integer('id_siswa').unsigned().notNullable();
    table.integer('id_mapel').unsigned().notNullable();
    table.decimal('tugas', 5, 2);
    table.decimal('ulangan', 5, 2);
    table.decimal('uts', 5, 2);
    table.decimal('uas', 5, 2);
    table.decimal('rata_rata', 5, 2);
    table.timestamps(true, true);
    table.foreign('id_siswa').references('id_siswa').inTable('siswa').onDelete('CASCADE');
    table.foreign('id_mapel').references('id_mapel').inTable('mapel').onDelete('CASCADE');
    table.unique(['id_siswa', 'id_mapel']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('nilai');
};
