import test from "node:test";
import assert from "node:assert/strict";

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

test("slugify creates SEO-safe Spanish slugs", () => {
  assert.equal(slugify("Faro LED Volkswagen Golf 7 2018"), "faro-led-volkswagen-golf-7-2018");
  assert.equal(slugify("Caja de cambios — Polo 1.0 TSI"), "caja-de-cambios-polo-1-0-tsi");
  assert.equal(slugify("Despiece SEAT León"), "despiece-seat-leon");
});
