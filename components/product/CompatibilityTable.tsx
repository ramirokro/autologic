import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { IVehicle } from "@/lib/types";
import { ChevronDownIcon } from "lucide-react";

interface CompatibilityTableProps {
  vehicles: IVehicle[];
  initialLimit?: number;
}

export default function CompatibilityTable({ 
  vehicles, 
  initialLimit = 6 
}: CompatibilityTableProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedVehicles = showAll ? vehicles : vehicles.slice(0, initialLimit);
  
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };
  
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full border border-neutral-200">
        <TableHeader className="bg-neutral-100">
          <TableRow>
            <TableHead className="py-2 px-4 border-b border-neutral-200 text-left text-sm font-medium">Año</TableHead>
            <TableHead className="py-2 px-4 border-b border-neutral-200 text-left text-sm font-medium">Marca</TableHead>
            <TableHead className="py-2 px-4 border-b border-neutral-200 text-left text-sm font-medium">Modelo</TableHead>
            <TableHead className="py-2 px-4 border-b border-neutral-200 text-left text-sm font-medium">Submodelo</TableHead>
            <TableHead className="py-2 px-4 border-b border-neutral-200 text-left text-sm font-medium">Motor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedVehicles.map((vehicle, index) => (
            <TableRow key={index} className={index % 2 === 1 ? "bg-neutral-50" : ""}>
              <TableCell className="py-2 px-4 border-b border-neutral-200 text-sm">{vehicle.year}</TableCell>
              <TableCell className="py-2 px-4 border-b border-neutral-200 text-sm">{vehicle.make}</TableCell>
              <TableCell className="py-2 px-4 border-b border-neutral-200 text-sm">{vehicle.model}</TableCell>
              <TableCell className="py-2 px-4 border-b border-neutral-200 text-sm">{vehicle.submodel || "—"}</TableCell>
              <TableCell className="py-2 px-4 border-b border-neutral-200 text-sm">{vehicle.engine || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {vehicles.length > initialLimit && (
        <div className="mt-4 text-right">
          <Button 
            variant="link" 
            className="text-blue-600"
            onClick={toggleShowAll}
          >
            {showAll ? "Ver menos vehículos" : "Ver más vehículos compatibles"}
            <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </Button>
        </div>
      )}
    </div>
  );
}
