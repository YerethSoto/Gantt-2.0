"use client";
import ProyectosTable from "@/app/components/ProyectosTable";

export default function ProyectosTablaPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <ProyectosTable />
      </div>
    </div>
  );
}