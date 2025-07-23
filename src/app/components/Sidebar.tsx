"use client";
import { useSidebar } from "../context/SidebarContext";
import { Sidebar as PrimeSidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function Sidebar() {
  const { isSidebarVisible, setSidebarVisible } = useSidebar();
  const router = useRouter();
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [showSubmenuProyectos, setShowSubmenuProyectos] = useState(false); // Estado para el nuevo submenu

  return (
    <PrimeSidebar
      visible={isSidebarVisible}
      onHide={() => setSidebarVisible(false)}
      showCloseIcon={false} // 🔹 Quita el botón de cierre de arriba
      className="w-64 h-screen bg-white text-gray-900 border-r shadow-lg p-2 transition-transform duration-300"
    >
      {/* Imagen favicon centrada */}
      <div className="flex justify-center mb-4">
        <Image
          src="/favicon.png"
          alt="Logo"
          width={75}  
          height={75}
          priority
        />
      </div>

      {/* Título del Sidebar */}
      <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">Menú Principal</h2>

      <ul className="space-y-4">
        <li>
          <Button
            label="Inicio"
            icon="pi pi-home"
            className="w-full flex items-center justify-start bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-3 rounded-lg"
            onClick={() => {
              router.push("/dashboard");
              setSidebarVisible(false);
            }}
          />
        </li>

        <li>
          <Button
            label="Ver Convenios"
            icon="pi pi-list"
            className="w-full flex items-center justify-start bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-3 rounded-lg"
            onClick={() => {
              router.push("/dashboard/convenios");
              setSidebarVisible(false);
            }}
          />
        </li>

        <li>
          <Button
            label="Inventario"
            icon="pi pi-folder"
            className="w-full flex items-center justify-start bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-3 rounded-lg"
            onClick={() => {
              router.push("/dashboard/inventario");
              setSidebarVisible(false);
            }}
          />
        </li>

        <li>
          <Button
            label="Ver Estadísticas"
            icon="pi pi-chart-bar"
            className="w-full flex items-center justify-start bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-3 rounded-lg"
            onClick={() => {
              router.push("/dashboard/estadistica");
              setSidebarVisible(false);
            }}
          />
        </li>



             {/* Dropdown para ver el apartado de proyectos */}
        <li>
          <Button
            label="Proyectos"
            icon="pi pi-folder"
            iconPos="left"
            className={`w-full flex items-center justify-between bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-3 rounded-lg ${
              showSubmenuProyectos ? "bg-[#CDA95F] text-black" : ""
            }`}
            onClick={() => setShowSubmenuProyectos((prev) => !prev)}
          >
            <span className="ml-auto pr-0">
              <i className={`pi pi-chevron-${showSubmenuProyectos ? "up" : "down"}`}></i>
            </span>
          </Button>

          {showSubmenuProyectos && (
            <ul className="pl-6 mt-2 space-y-2">
              <li>
                <Button
                  label="Añadir o Editar"
                  className="w-full justify-start bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-2 rounded-md"
                  onClick={() => {
                    router.push("/dashboard/proyecto");
                    setSidebarVisible(false);
                  }}
                />
              </li>
              <li>
                <Button
                  label="Ver estadísticas"
                  className="w-full justify-start bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-2 rounded-md"
                  onClick={() => {
                    router.push("/dashboard/graficasProyecto");
                    setSidebarVisible(false);
                  }}
                />
              </li>
            </ul>
          )}
        </li>

        {/* Dropdown para ver el apartado de oportunidades */}
        <li>
          <Button
            label="Oportunidades profesionales"
            icon="pi pi-thumbtack"
            iconPos="left"
            className={`w-full flex items-center justify-between bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-3 rounded-lg ${
              showSubmenu ? "bg-[#CDA95F] text-black" : ""
            }`}
            onClick={() => setShowSubmenu((prev) => !prev)}
          >
            <span className="ml-auto pr-0">
              <i className={`pi pi-chevron-${showSubmenu ? "up" : "down"}`}></i>
            </span>
          </Button>

          {showSubmenu && (
            <ul className="pl-6 mt-2 space-y-2">
              <li>
                <Button
                  label="Datos"
                  className="w-full justify-start bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-2 rounded-md"
                  onClick={() => {
                    router.push("/dashboard/oportunidades");
                    setSidebarVisible(false);
                  }}
                />
              </li>
              <li>
                <Button
                  label="Ver estadísticas"
                  className="w-full justify-start bg-gray-100 text-gray-700 hover:bg-[#CDA95F] hover:text-white transition-all duration-300 p-2 rounded-md"
                  onClick={() => {
                    router.push("/dashboard/graficasOport");
                    setSidebarVisible(false);
                  }}
                />
              </li>
            </ul>
          )}
        </li>

   
      </ul>
    </PrimeSidebar>
  );
}
