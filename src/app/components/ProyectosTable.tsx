"use client";
import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Extend jsPDF with autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Proyecto {
  NumProyecto: number | string;
  NombreProyecto: string;
  ActorCooperacion: string;
  Areas: string;
  Dependencia: string;
  Ano: string | number;
  Objetivos: string;
  InstitucionSolicitante?: string;
  NombreActor?: string;
  ObjetivoGeneral?: string;
  Resultados?: string;
  CostoTotal?: string | number;
  ContrapartidaInstitucion?: string | number;
  ContrapartidaCooperante?: string | number;
  EtapaProyecto?: string;
  TipoProyecto?: string;
  Documentos?: string;
  Observaciones?: string;
  Region?: string;
  Direccion?: string;
  FechaAprovacion?: string;
}

export default function ProyectosTable() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef<Toast>(null);

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      const response = await fetch("/api/proyectos");
      const data = await response.json();
      setProyectos(data || []);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudieron obtener los proyectos",
        life: 3000,
      });
    }
  };

  const formatMoney = (value?: string | number) => {
    if (!value) return "";
    const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;
    return isNaN(num) ? "" : `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const exportToExcel = () => {
    const exportData = proyectos.map((p) => ({
      "Número de proyecto": p.NumProyecto,
      "Nombre de proyecto": p.NombreProyecto,
      "Institución solicitante": p.InstitucionSolicitante,
      "Nombre actor": p.NombreActor,
      "Objetivo general": p.ObjetivoGeneral || p.Objetivos,
      "Resultado": p.Resultados,
      "Departamento": p.Dependencia,
      "Costo total": formatMoney(p.CostoTotal),
      "Contrapartida institución": formatMoney(p.ContrapartidaInstitucion),
      "Contrapartida cooperante": formatMoney(p.ContrapartidaCooperante),
      "Actor de cooperación": p.ActorCooperacion,
      "Etapa de proyecto": p.EtapaProyecto,
      "Tipo de proyecto": p.TipoProyecto,
      "Documentos": p.Documentos,
      "Observaciones": p.Observaciones,
      "Objetivos": p.Objetivos,
      "Resultados": p.Resultados,
      "Región": p.Region,
      "Dirección": p.Direccion,
      "Año": p.Ano,
      "Área": p.Areas,
      "Fecha de aprobación": formatDate(p.FechaAprovacion),
      "Region": p.Region || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proyectos");
    XLSX.writeFile(wb, "proyectos.xlsx");
  };

  const rowExpansionTemplate = (rowData: Proyecto) => (
    <div className="p-4 text-sm bg-gray-50 rounded-lg border border-gray-200">
      <strong>Objetivo general:</strong>
      <p className="mt-2 text-gray-700 whitespace-pre-line">{rowData.Objetivos}</p>
    </div>
  );

  const exportProyectoPDF = (proyecto: Proyecto) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Ficha de proyecto", 105, 20, { align: "center" });

    const fields = [
      ["Número de proyecto", proyecto.NumProyecto?.toString() || ""],
      ["Región", proyecto.Region || ""],
      ["Nombre de proyecto", proyecto.NombreProyecto || ""],
      ["Institución solicitante", proyecto.InstitucionSolicitante || ""],
      ["Nombre actor", proyecto.NombreActor || ""],
      ["Objetivo general", proyecto.ObjetivoGeneral || proyecto.Objetivos || ""],
      ["Resultado", proyecto.Resultados || ""],
      ["Departamento", proyecto.Dependencia || ""],
      ["Costo total", formatMoney(proyecto.CostoTotal)],
      ["Contrapartida institución", formatMoney(proyecto.ContrapartidaInstitucion)],
      ["Contrapartida cooperante", formatMoney(proyecto.ContrapartidaCooperante)],
      ["Actor de cooperación", proyecto.ActorCooperacion || ""],
      ["Etapa de proyecto", proyecto.EtapaProyecto || ""],
      ["Tipo de proyecto", proyecto.TipoProyecto || ""],
      ["Documentos", proyecto.Documentos || ""],
      ["Observaciones", proyecto.Observaciones || ""],
      ["Objetivos", proyecto.Objetivos || ""],
      ["Resultados", proyecto.Resultados || ""],
      ["Región", proyecto.Region || ""],
      ["Dirección", proyecto.Direccion || ""],
      ["Año", proyecto.Ano?.toString() || ""],
      ["Área", proyecto.Areas || ""],
      ["Fecha de aprobación", formatDate(proyecto.FechaAprovacion)],
    ].filter(([_, value]) => value !== "");

    autoTable(doc, {
      startY: 30,
      head: [["Campo", "Valor"]],
      body: fields,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [205, 169, 95] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 },
      tableWidth: 180,
    });

    doc.save(`proyecto_${proyecto.NumProyecto}.pdf`);
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 w-full max-w-md">
          <i className="pi pi-search text-gray-500" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar..."
            className="p-inputtext-sm w-full border border-gray-400 rounded-md px-3 py-2 bg-white shadow-sm focus:ring-2
                       focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          />
        </div>
        <Button
          label="Exportar a Excel"
          icon="pi pi-file-excel"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm"
          onClick={exportToExcel}
        />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8 text-center">Lista de proyectos</h2>
      <div className="h-4" />
      <DataTable
        value={proyectos}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="NumProyecto"
        paginator
        rows={10}
        filters={{ global: { value: globalFilter, matchMode: FilterMatchMode.CONTAINS } }}
        globalFilterFields={[
          "NumProyecto",
          "NombreProyecto",
          "ActorCooperacion",
          "Areas",
          "Region",
          "Ano",
          
        ]}
        className="text-sm border border-gray-200 rounded-lg shadow-sm"
        responsiveLayout="scroll"
      >
        <Column expander style={{ width: "3rem" }} />
        <Column field="NumProyecto" header="Número de proyecto" sortable />
        <Column field="NombreProyecto" header="Nombre de proyecto" sortable />
        <Column field="ActorCooperacion" header="Socio estratégico" sortable />
        <Column field="Areas" header="Área" sortable />
        <Column field="Region" header="Región" sortable />
        <Column field="Ano" header="Año" sortable />
        <Column
          header="PDF"
          body={(rowData) => (
            <Button
              icon="pi pi-file-pdf"
              className="p-button-text p-button-danger"
              onClick={() => exportProyectoPDF(rowData)}
              tooltip="Exportar PDF"
            />
          )}
          style={{ width: "4rem" }}
        />
      </DataTable>
    </div>
  );
}