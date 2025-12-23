const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validateNilai = (nilai) => {
  return nilai >= 0 && nilai <= 100
}

const validateSemester = (semester) => {
  return semester === "1" || semester === "2"
}

module.exports = {
  validateEmail,
  validateNilai,
  validateSemester,
}
