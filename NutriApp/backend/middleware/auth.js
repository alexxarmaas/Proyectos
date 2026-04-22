const { get } = require("../db");

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const token = header.replace("Bearer ", "").trim();
    const session = await get(
      `
      SELECT s.token, u.id, u.name, u.email
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
    `,
      [token]
    );

    if (!session) {
      res.status(401).json({ message: "Sesion invalida" });
      return;
    }

    req.authToken = token;
    req.user = {
      id: session.id,
      name: session.name,
      email: session.email
    };
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authRequired };
