import { strict as assert } from "node:assert";
import { dashboard, copilotInsights } from "./domain.js";
import { seedDb } from "./store.js";

const db = seedDb();
const report = dashboard(db, "last30");

assert.equal(db.products.length, 5);
assert.ok(report.kpis.monthSales >= 0);
assert.ok(report.kpis.inventoryValue > 0);
assert.ok(report.topProducts.length > 0);
assert.ok(copilotInsights(db).recommendations.length > 0);

console.log("Domain checks passed");
