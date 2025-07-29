"use client";
import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function GraficoCooperacionTipo() {
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

  // Clasificar proyectos como Multilateral, Bilateral u Otro
  const clasificacion = {
    multilateral: 0,
    bilateral: 0,
  };

  proyectosFiltrados.forEach((p) => {
    const actor = (p.ActorCooperacion || "").toLowerCase();
    if (actor.includes("multilateral")) {
      clasificacion.multilateral++;
    } else if (actor.includes("bilateral")) {
      clasificacion.bilateral++;
    } 
  });

  const totalProyectos = proyectosFiltrados.length;
  const porcentajeMultilateral = totalProyectos > 0 ? (clasificacion.multilateral / totalProyectos) * 100 : 0;
  const porcentajeBilateral = totalProyectos > 0 ? (clasificacion.bilateral / totalProyectos) * 100 : 0;

  const pieChartData = {
    labels: [
      `Multilateral (${porcentajeMultilateral.toFixed(1)}%)`,
      `Bilateral (${porcentajeBilateral.toFixed(1)}%)`,
    ],
    datasets: [
      {
        data: [clasificacion.multilateral, clasificacion.bilateral],
        backgroundColor: ["#182951", "#CFAC65", "#C1C5C8"],
        borderColor: "#fff",
        borderWidth: 2
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true
        }
      },
      datalabels: {
        color: "#fff",
        formatter: (value: number, context: any) => {
          const sum = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(1);
          return `${percentage}%`;
        },
        font: {
          weight: "bold",
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} proyectos`;
          }
        }
      }
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 pr-4 border-r border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">Tipo de Cooperación</h2>
            <Dropdown
              value={anioSeleccionado}
              options={aniosDisponibles.map((a) => ({ label: a, value: a }))}
              onChange={(e) => setAnioSeleccionado(e.value)}
              placeholder="Todos los años"
              className="w-40 text-sm"
              showClear
            />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#18295110', borderLeft: '4px solid #182951' }}>
              <div className="flex items-center mb-2">
                <span className="w-3 h-3 rounded-full inline-block mr-2" style={{ backgroundColor: "#182951" }}></span>
                <span className="text-gray-700 font-medium">Multilateral</span>
              </div>
              <p className="text-2xl font-bold">{clasificacion.multilateral}</p>
              <p className="text-gray-600">{porcentajeMultilateral.toFixed(1)}% del total</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: '#CFAC6510', borderLeft: '4px solid #CFAC65' }}>
              <div className="flex items-center mb-2">
                <span className="w-3 h-3 rounded-full inline-block mr-2" style={{ backgroundColor: "#CFAC65" }}></span>
                <span className="text-gray-700 font-medium">Bilateral</span>
              </div>
              <p className="text-2xl font-bold">{clasificacion.bilateral}</p>
              <p className="text-gray-600">{porcentajeBilateral.toFixed(1)}% del total</p>
            </div>

          
          </div>
        </div>

        <div className="w-full lg:w-3/4 pl-4 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Distribución por tipo de cooperación
          </h2>

          <div className="relative" style={{ width: '100%', height: '500px', maxWidth: '600px' }}>
            <Chart type="pie" data={pieChartData} options={chartOptions} className="w-full h-full" />
          </div>

          <div className="w-full mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Tipos de cooperación</h3>
            <p className="text-gray-600">
              Este gráfico muestra la proporción de proyectos según su tipo de cooperación:
              <br />
              - <strong>Multilateral</strong>: Cooperación con organismos internacionales
              <br />
              - <strong>Bilateral</strong>: Cooperación directa entre países
              <br />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}