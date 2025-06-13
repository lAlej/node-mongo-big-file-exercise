const Records = require("./records.model");
const csv = require("jquery-csv");
const fs = require("fs");

const upload = async (req, res) => {
  const { file } = req;

  //Se lee el archivo y se convierte en un array de objetos
  fs.readFile(file.path, "utf8", async (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading file" });
    }
    // Se convierte en un array 
    const records = csv.toObjects(data);

    // Se le agrega insertOne a cada objeto para poder usar el bulkWrite
    let bulk = records.map((record) => ({
      insertOne: {
        document: record,
      },
    }));

    // Se insertan los registros en la db utilizando bulkWrite 
    try {
      await Records.collection.bulkWrite(bulk);
      return res.status(200).json({
        message: "Archivo procesado",
      });
    } catch (error) {
      return res.status(500).json({ message: "Error inserting records" });
    }
  });
};

const list = async (_, res) => {
  try {
    const data = await Records.find({}).limit(10).lean();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  upload,
  list,
};
