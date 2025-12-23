/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('siswa', table => {
    table.increments('id_siswa').primary();
    table.string('nis', 20).unique().notNullable();
    table.string('nama_siswa', 50).notNullable();
    table.date('tanggal_lahir');
    table.enum('jenis_kelamin', ['L', 'P']).notNullable();
    table.integer('id_kelas').unsigned().notNullable();
    table.integer('id_user').unsigned();
    table.timestamps(true, true);
    table.foreign('id_kelas').references('id_kelas').inTable('kelas').onDelete('RESTRICT');
    table.foreign('id_user').references('id_user').inTable('user').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('siswa');
};
