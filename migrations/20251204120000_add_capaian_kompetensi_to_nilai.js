/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("nilai", (table) => {
    table.text("capaian_kompetensi").nullable().after("rata_rata")
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("nilai", (table) => {
    table.dropColumn("capaian_kompetensi")
  })
}

