"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type VehicleDraft = {
  vehicleType: string;
  plateNo: string;
  emirate: string;
  driverName: string;
  licenseNo: string;
  licenseExpiry: string;
};

export function OptionalVehicles({
  vehicles,
  onChange,
}: {
  vehicles: VehicleDraft[];
  onChange: (vehicles: VehicleDraft[]) => void;
}) {
  return (
    <section className="space-y-3 rounded-2xl bg-white/5 p-4">
      <h3 className="font-semibold">Vehicles</h3>
      <p className="text-sm text-muted-foreground">Optional. Add a vehicle if one will enter SMA. Leave this blank if no vehicle is coming.</p>
      {vehicles.map((vehicle, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Vehicle type" value={vehicle.vehicleType} onChange={(event) => update(index, { vehicleType: event.target.value })} />
          <Input placeholder="Plate number" value={vehicle.plateNo} onChange={(event) => update(index, { plateNo: event.target.value })} />
          <Input placeholder="Driver name" value={vehicle.driverName} onChange={(event) => update(index, { driverName: event.target.value })} />
          <Button type="button" variant="ghost" onClick={() => onChange(vehicles.filter((_, item) => item !== index))}>Remove</Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...vehicles, { vehicleType: "", plateNo: "", emirate: "", driverName: "", licenseNo: "", licenseExpiry: "" }])}
      >
        Add vehicle
      </Button>
    </section>
  );

  function update(index: number, patch: Partial<VehicleDraft>) {
    const next = [...vehicles];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }
}
