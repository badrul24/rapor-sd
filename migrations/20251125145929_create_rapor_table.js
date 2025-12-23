/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('rapor', table => {
    table.increments('id_rapor').primary();
    table.integer('id_siswa').unsigned().notNullable();
    table.enum('semester', ['1', '2']).notNullable();
    table.string('tahun_ajaran', 10).notNullable();
    table.text('catatan_guru');
    table.date('tanggal_cetak');
    table.timestamps(true, true);
    table.foreign('id_siswa').references('id_siswa').inTable('siswa').onDelete('CASCADE');
    table.index(['id_siswa', 'semester']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rapor');
};
