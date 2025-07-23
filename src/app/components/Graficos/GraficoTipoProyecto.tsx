"use client";
import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";

export default function GraficoTipoProyecto() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/proyectos`);
        if (!response.ok) throw new Error("Error obteniendo proyectos");
        const data = await response.json();
        setProyectos(data);
      } catch (error) {
        console.error("Error obteniendo proyectos:", error);
      }
    }
    fetchData();
  }, []);

  const aniosDisponibles = Array.from(
    new Set(
      proyectos
        .map((p) => p.Ano?.toString())
        .filter((a) => a !== undefined && a !== "")
    )
  ).sort();

  const proyectosFiltrados = anioSeleccionado
    ? proyectos.filter((p) => p.Ano?.toString() === anioSeleccionado)
    : proyectos;

  // Agrupar por Tipo de Proyecto
  const agrupado: Record<string, any[]> = {};
  proyectosFiltrados.forEach((p) => {
    const tipo = p.TipoProyecto || "Sin tipo";
    if (!agrupado[tipo]) agrupado[tipo] = [];
    agrupado[tipo].push(p);
  });

  const labels = Object.keys(agrupado);
  const valores = labels.map((t) => agrupado[t].length);

  const colores = [
    "#CFAC65", "#182951", "#F2DAB1", "#C1C5C8", "#0034A0", "#8B5CF6", "#10B981", "#F97316", "#EF4444"
  ];
  const pieChartData = {
    labels,
    datasets: [
      {
        data: valores,
        backgroundColor: colores,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg flex flex-col items-center">
      <h2 className="text-lg font-bold mb-4 text-gray-700">Proyectos por Tipo de Proyecto</h2>
      <div className="flex items-center gap-6 mb-6">
        <div className="w-[500px] h-[500px]">
          <Chart type="pie" data={pieChartData} options={chartOptions} />
        </div>
        <div>
          <Dropdown
            value={anioSeleccionado}
            options={aniosDisponibles.map((a) => ({ label: a, value: a }))}
            onChange={(e) => setAnioSeleccionado(e.value)}
            placeholder="Año"
            className="w-32 text-sm"
            showClear
          />
        </div>
      </div>
      <div className="w-full mt-4">
        <ul className="list-disc list-inside text-sm text-gray-600">
          {labels.map((tipo, idx) => (
            <li key={idx}>
              <span className="font-semibold">{tipo}:</span> {agrupado[tipo].length} proyectos
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}