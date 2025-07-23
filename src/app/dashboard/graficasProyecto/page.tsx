"use client";
import { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import GraficoDireccion from "@/app/components/Graficos/GraficoDireccion";
import GraficoArea from "@/app/components/Graficos/GraficoArea";
import GraficoTipoProyecto from "@/app/components/Graficos/GraficoTipoProyecto";
import { useRouter } from 'next/navigation'; // Note: 'next/navigation' for App Router
import { Router } from "next/router";
export default function GraficasProyectoPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter(); 

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="custom-tabs">
          <TabView
            className="slanted-tabview"
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >
            <TabPanel header="Dirección">
              <div className="p-4 fade-in">
                <GraficoDireccion />
              </div>
            </TabPanel>
            <TabPanel header="Área">
              <div className="p-4 fade-in">
                <GraficoArea />
              </div>
            </TabPanel>
            <TabPanel header="Tipo de Proyecto">
              <div className="p-4 fade-in">
                <GraficoTipoProyecto />
              </div>
            </TabPanel>
          <TabPanel header="Ir a proyectos">
  <div className="p-4 fade-in">
    <button 
      onClick={() => router.push('/dashboard/proyecto')}
      className="your-button-classes"
    >
      Ir a proyectos para añadir o editar
    </button>
  </div>
</TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  );
}