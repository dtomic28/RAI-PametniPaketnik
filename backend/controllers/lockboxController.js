// GET /lockbox
function defaultHandler(req, res) {
  res.json({ message: "default function in lockboxController" });
}

module.exports = {
  default: defaultHandler,
};
