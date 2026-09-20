import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Role, User } from "./models.js";

const JWT_SECRET = process.env.JWT_SECRET || "retailops-secret-key-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compareSync(password, hash);
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwtToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Bearer token required" });
  }

  // 1. Try static demo token first (e.g. owner-token, super-token)
  let user = await User.findOne({ token }).lean();

  // 2. If not a demo token, attempt JWT verification
  if (!user) {
    const decoded = verifyJwtToken(token);
    if (decoded && (decoded.id || decoded.email)) {
      user = await User.findOne({
        $or: [{ id: decoded.id }, { email: decoded.email }]
      }).lean();
    }
  }

  if (!user) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid or expired authorization token" });
  }

  req.user = user;
  next();
}

export function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const role = await Role.findOne({
      $or: [{ id: req.user.role }, { name: req.user.role }]
    }).lean();

    const grants = role?.permissions || [];
    const impliedManage = permission.endsWith(":read") && grants.includes(permission.replace(":read", ":manage"));

    if (grants.includes("*") || grants.includes(permission) || impliedManage) {
      return next();
    }

    return res.status(403).json({ error: "FORBIDDEN", permission, message: `Role '${req.user.role}' lacks permission '${permission}'` });
  };
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, token, _id, __v, ...safe } = user;
  return safe;
}
