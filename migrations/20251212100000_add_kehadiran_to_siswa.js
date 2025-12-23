exports.up = function (knex) {
  return knex.schema.table("siswa", function (table) {
    table.integer("hadir").notNullable().defaultTo(0)
    table.integer("izin").notNullable().defaultTo(0)
    table.integer("sakit").notNullable().defaultTo(0)
  })
}

exports.down = function (knex) {
  return knex.schema.table("siswa", function (table) {
    table.dropColumn("hadir")
    table.dropColumn("izin")
    table.dropColumn("sakit")
  })
}

