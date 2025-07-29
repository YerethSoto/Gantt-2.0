"use client";
import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function GraficoContrapartidas() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<string | null>(null);
  const [chartSize, setChartSize] = useState(600);

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

    const handleResize = () => {
      setChartSize(Math.min(window.innerWidth * 0.7, 800));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aniosDisponibles = Array.from(
    new Set(
      proyectos
        .map((p) => p.Ano?.toString())
        .filter((a) => a !== undefined && a !== "")
    )
  ).sort();

  // Filter projects by EtapaProyecto = "Finalización"
  const proyectosFiltrados = (anioSeleccionado
    ? proyectos.filter((p) => p.Ano?.toString() === anioSeleccionado)
    : proyectos).filter(p => {
      const etapa = (p.EtapaProyecto || "").toString().toLowerCase().trim();
      return etapa.includes("finalización") || etapa.includes("finalizacion") || etapa.includes("finalizado");
    });

  // Calculate totals with proper initial values
  const totalCooperante = proyectosFiltrados.reduce(
    (sum, p) => sum + (Number(p.ContrapartidaCooperante) || 0),
    0
  );
  
  const totalInstitucion = proyectosFiltrados.reduce(
    (sum, p) => sum + (Number(p.ContrapartidaInstitucion) || 0),
    0
  );

  // Calculate percentages
  const totalGeneral = totalCooperante + totalInstitucion;
  const porcentajeCooperante = totalGeneral > 0 
    ? (totalCooperante / totalGeneral) * 100 
    : 0;
  const porcentajeInstitucion = totalGeneral > 0 
    ? (totalInstitucion / totalGeneral) * 100 
    : 0;

  const pieChartData = {
    labels: [
      `Cooperante (${porcentajeCooperante.toFixed(1)}%)`, 
      `Institución (${porcentajeInstitucion.toFixed(1)}%)`
    ],
    datasets: [
      {
        data: [totalCooperante, totalInstitucion],
        backgroundColor: ["#182951", "#CFAC65"],
        borderColor: ["#fff", "#fff"],
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
            size: 16,
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
          const percentage = sum > 0 ? ((value / sum) * 100).toFixed(1) : '0';
          return `${percentage}%`;
        },
        font: {
          weight: "bold",
          size: 18,
        },
      },
      tooltip: {
        bodyFont: {
          size: 14
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 lg:pr-4 lg:border-r lg:border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">Contrapartidas</h2>
            <Dropdown
              value={anioSeleccionado}
              options={aniosDisponibles.map((a) => ({ label: a, value: a }))}
              onChange={(e) => setAnioSeleccionado(e.value)}
              placeholder="Todos los años"
              className="w-40 text-sm"
              showClear
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#18295110', borderLeft: '4px solid #182951' }}>
              <div className="flex items-center mb-2">
                <span className="w-3 h-3 rounded-full inline-block mr-2" style={{ backgroundColor: "#182951" }}></span>
                <span className="text-gray-700 font-medium">Cooperante</span>
              </div>
              <p className="text-2xl font-bold">${totalCooperante.toLocaleString('en-US')}</p>
              <p className="text-gray-600">{porcentajeCooperante.toFixed(1)}% del total</p>
              <p className="text-xs text-gray-500 mt-1">
                Proyectos en finalización: {proyectosFiltrados.length}
              </p>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#CFAC6510', borderLeft: '4px solid #CFAC65' }}>
              <div className="flex items-center mb-2">
                <span className="w-3 h-3 rounded-full inline-block mr-2" style={{ backgroundColor: "#CFAC65" }}></span>
                <span className="text-gray-700 font-medium">Institución</span>
              </div>
              <p className="text-2xl font-bold">${totalInstitucion.toLocaleString('en-US')}</p>
              <p className="text-gray-600">{porcentajeInstitucion.toFixed(1)}% del total</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Distribución de contrapartidas 
            </h2>
            
            <div 
              className="relative" 
              style={{ 
                width: `${chartSize}px`, 
                height: `${chartSize}px`,
                maxWidth: '100%'
              }}
            >
              <Chart 
                type="pie" 
                data={pieChartData} 
                options={chartOptions} 
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Balance de contrapartidas</h3>
        <p className="text-gray-600">
          Este gráfico muestra la proporción entre la contrapartida aportada por el cooperante
          y la contrapartida institucional para proyectos en etapa de finalización.
        </p>
      </div>
    </div>
  );
}