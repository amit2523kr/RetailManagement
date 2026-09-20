import { randomUUID } from "node:crypto";
import { AuditLog } from "./models.js";

export async function audit(actor, action, entity, entityId, metadata = {}) {
  await AuditLog.create({
    id: `aud_${randomUUID()}`,
    actorId: actor?.id || "system",
    action,
    entity,
    entityId,
    createdAt: new Date().toISOString(),
    metadata
  });
}
