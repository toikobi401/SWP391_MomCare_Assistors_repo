// [POST] /api/upload/
module.exports.upload = async (req, res) => {
  res.json({
    location: req.body.file
  });
};