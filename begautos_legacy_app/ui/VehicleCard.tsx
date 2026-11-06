import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Fuel, Gauge } from "lucide-react";
import { formatBDT } from "@/lib/utils";

export interface VehicleCardData {
  id: number;
  name: string;
  slug?: string;
  model?: string;
  year?: number;
  fuel_type?: string;
  mileage?: string;
  car_type?: string;
  price: number | string | null;
  feature_image: string | null;
  registered?: string;
}

/** Presentation only: existing inventory links and sold/pre-order rules. */
export default function VehicleCard({ car }: { car: VehicleCardData }) {
  const sold = car.registered === "Sold";
  const price = String(car.price) === "Pre-Order" ? "Available for Pre-Order"
    : !car.price || Number(car.price) === 0 ? "Contact for price" : formatBDT(Number(car.price));

  return (
    <Link href={`/cars/${car.slug || car.id}`} className="dream-car-card">
      <div className="dream-car-image">
        {car.feature_image ? <Image src={car.feature_image} alt={car.name} fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
          : <span className="dream-image-empty">No image available</span>}
        {car.year ? <span className="dream-car-year">{car.year}</span> : null}
        {sold ? <span className="dream-car-sold">Sold</span> : null}
      </div>
      <div className="dream-car-content">
        {car.model ? <p className="dream-car-model">{car.model}</p> : null}
        <h3>{car.name}</h3>
        <div className="dream-car-specs">
          {car.mileage ? <span><Gauge size={16} aria-hidden="true" />{car.mileage}</span> : null}
          {car.fuel_type ? <span><Fuel size={16} aria-hidden="true" />{car.fuel_type.toLowerCase().replace(/phev/gi, "PHEV")}</span> : null}
          {car.car_type ? <span>{car.car_type.toLowerCase().replace(/_/g, " ")}</span> : null}
        </div>
        <div className="dream-car-bottom">
          {!sold ? <strong>{price}</strong> : <strong>Sold</strong>}
          <span className="dream-view-car">View Car <ArrowUpRight size={18} aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  );
}
