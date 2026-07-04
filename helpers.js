const generateStudentId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000);
  return `HOSTEL${year}${random}`;
};

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

module.exports = { generateStudentId, calculateAge };