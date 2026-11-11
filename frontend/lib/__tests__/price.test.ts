import test from "node:test";
import assert from "node:assert/strict";
import { formatVehiclePrice, parseVehiclePriceNumber } from "../utils.ts";

test("formatVehiclePrice formats BDT amounts using South Asian digit grouping", () => {
  assert.equal(formatVehiclePrice("35000000.00", false), "BDT 3,50,00,000");
  assert.equal(formatVehiclePrice(28500000, false), "BDT 2,85,00,000");
  assert.equal(formatVehiclePrice("BDT 14500000", false), "BDT 1,45,00,000");
  assert.equal(formatVehiclePrice("38000000.00", true), "Call for Price");
  assert.equal(
    formatVehiclePrice("38000000.00", true, "Price Upon Request • VIP Consultation"),
    "Price Upon Request • VIP Consultation"
  );
  assert.equal(formatVehiclePrice("Sold", false), "Sold");
  assert.equal(formatVehiclePrice("Pre-Order", false), "Pre-Order");
  assert.equal(formatVehiclePrice("", false), "Call for Price");
  assert.equal(formatVehiclePrice("0", false), "Call for Price");
});

test("parseVehiclePriceNumber extracts numeric amounts cleanly", () => {
  assert.equal(parseVehiclePriceNumber("35000000.00", false), 35000000);
  assert.equal(parseVehiclePriceNumber("BDT 2,85,00,000", false), 28500000);
  assert.equal(parseVehiclePriceNumber("35000000.00", true), null);
  assert.equal(parseVehiclePriceNumber("Call for Price", false), null);
  assert.equal(parseVehiclePriceNumber("Sold", false), null);
});
