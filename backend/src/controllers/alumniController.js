// Controller: Alumni ile ilgili istekleri ve iş mantığını yönetir

const getAlumni = (req, res) => {
  // HTTP 200 OK durum kodu ile "OK" yanıtı döner
  res.status(200).send('OK');
};

module.exports = {
  getAlumni
};
