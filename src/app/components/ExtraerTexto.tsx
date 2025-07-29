"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { toast } from "react-toastify";
import Select from "react-select";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

type AreaOption = {
  value: string;
  label: string;
};

const initialFormState = {
  nombreProyecto: "",
  institucionSolicitante: "",
  nombreActor: "",
  objetivoGeneral: "",
  resultado: "",
  departamento: "",
  costoTotal: "",
  contrapartidaInstitucion: "",
  contrapartidaCooperante: "",
  actorDeCooperacion: "",
  NumeroDeProyecto: "",
  etapaDeProyecto: "",
  tipoDeProyecto: "",
  documentos: "",
  observaciones: "",
  objetivos: "",
  resultados: "",
  tematicas: "",
  direccion: "",
  ano: "",
  areas: "",
  fechaAprobacion: "",
  Region: "",
};

const DIRECCION_OPTIONS = [
  { value: "Viceministro Académico", label: "Viceministro Académico" },
  {
    value: "Viceministro de Planificación Institucional y Coordinación Regional",
    label: "Viceministro de Planificación Institucional y Coordinación Regional",
  },
  { value: "Viceministro Administrativo", label: "Viceministro Administrativo" },
  {
    value: "Unidad para la Promoción de la Igualdad de Género",
    label: "Unidad para la Promoción de la Igualdad de Género",
  },
  { value: "Contraloría de servicios", label: "Contraloría de servicios" },
  { value: "Auditoría Interna", label: "Auditoría Interna" },
  { value: "Prensa y Relaciones Públicas", label: "Prensa y Relaciones Públicas" },
  { value: "Asuntos internacionales y Cooperación", label: "Asuntos internacionales y Cooperación" },
  { value: "Asuntos Jurídicos", label: "Asuntos Jurídicos" },
  { value: "Educación Privada", label: "Educación Privada" },
  { value: "Recursos Tecnológicos en Educación", label: "Recursos Tecnológicos en Educación" },
  { value: "Educación Técnica y Capacidades Emprendedoras", label: "Educación Técnica y Capacidades Emprendedoras" },
  { value: "Desarrollo Curricular", label: "Desarrollo Curricular" },
  { value: "Vida Estudiantil", label: "Vida Estudiantil" },
  { value: "Gestión y Evaluación", label: "Gestión y Evaluación" },
  { value: "Gestión y Desarrollo Regional", label: "Gestión y Desarrollo Regional" },
  { value: "Proveeduría Institucional", label: "Proveeduría Institucional" },
  { value: "Financiera", label: "Financiera" },
  { value: "Planificación Institucional", label: "Planificación Institucional" },
  { value: "Gestión de Talento Humano", label: "Gestión de Talento Humano" },
  { value: "Infraestructura Educativa", label: "Infraestructura Educativa" },
  { value: "Programas de Equidad", label: "Programas de Equidad" },
  { value: "Informática de Gestión", label: "Informática de Gestión" },
  { value: "Servicios Generales", label: "Servicios Generales" },
  { value: "Direcciones Regionales de Educación", label: "Direcciones Regionales de Educación" },
];

const REGION_OPTIONS = [
  { value: "San José-Central", label: "San José-Central" },
  { value: "San José-Norte", label: "San José-Norte" },
  { value: "San José Sur-Oeste", label: "San José Sur-Oeste" },
  { value: "Desamparados", label: "Desamparados" },
  { value: "Los Santos", label: "Los Santos" },
  { value: "Puriscal", label: "Puriscal" },
  { value: "Pérez Zeledón", label: "Pérez Zeledón" },
  { value: "Alajuela", label: "Alajuela" },
  { value: "Occidente", label: "Occidente" },
  { value: "San Carlos", label: "San Carlos" },
  { value: "Zona Norte-Norte", label: "Zona Norte-Norte" },
  { value: "Cartago", label: "Cartago" },
  { value: "Turrialba", label: "Turrialba" },
  { value: "Heredia", label: "Heredia" },
  { value: "Sarapiquí", label: "Sarapiquí" },
  { value: "Liberia", label: "Liberia" },
  { value: "Cañas", label: "Cañas" },
  { value: "Nicoya", label: "Nicoya" },
  { value: "Santa Cruz", label: "Santa Cruz" },
  { value: "Puntarenas", label: "Puntarenas" },
  { value: "Peninsular", label: "Peninsular" },
  { value: "Aguirre", label: "Aguirre" },
  { value: "Grande de Térraba", label: "Grande de Térraba" },
  { value: "Coto", label: "Coto" },
  { value: "Limón", label: "Limón" },
  { value: "Sulá", label: "Sulá" },
  { value: "Guápiles", label: "Guápiles" },
  { value: "Nacional", label: "Nacional" },
];

const AREAS_OPTIONS: AreaOption[] = [
  { value: "Educación para el Desarrollo Sostenible", label: "Educación para el Desarrollo Sostenible" },
  { value: "Innovación y fortalecimiento en los aprendizajes", label: "Innovación y fortalecimiento en los aprendizajes" },
  { value: "Transformación digital", label: "Transformación digital" },
  { value: "Reforzamiento de los aprendizaje", label: "Reforzamiento de los aprendizaje" },
  { value: "Formación permanente", label: "Formación permanente" },
  { value: "Educación técnica profesional", label: "Educación técnica profesional" },
  { value: "Gestión educativa", label: "Gestión educativa" },
  { value: "Otro", label: "Otro" },
];

export default function PDFExtractor() {
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);
  const [selectedAreaOption, setSelectedAreaOption] = useState<AreaOption | null>(null);
  const [customArea, setCustomArea] = useState("");
  const [otherAreaValue, setOtherAreaValue] = useState("");
  const [fullText, setFullText] = useState("");
  const [outputSnippet, setOutputSnippet] = useState("Selecciona un campo para ver el origen");
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      setIsPdfJsLoaded(true);
    }
  }, []);

  function extractAfterKeyword(keyword: string, lines: string[], numLines = 1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(keyword.toLowerCase())) {
        const idx = lines[i].indexOf(":");
        if (idx !== -1 && lines[i].length > idx + 1) {
          let value = lines[i].substring(idx + 1).trim();
          value = value.replace(/^\d+:\s*/, "");
          if (value) return value;
        }
        const result: string[] = [];
        let j = 1;
        while (result.length < numLines && i + j < lines.length) {
          let next = lines[i + j].trim().replace(/^\d+:\s*/, "");
          if (next) result.push(next);
          j++;
        }
        return result.join(" ");
      }
    }
    return "";
  }

  function extractObjetivoGeneral(lines: string[]) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes("objetivo general del proyecto")) {
        const result: string[] = [];
        const idx = lines[i].indexOf(":");
        if (idx !== -1 && lines[i].length > idx + 1) {
          const first = lines[i].substring(idx + 1).trim();
          if (first) result.push(first);
        }
        let j = 1;
        while (i + j < lines.length) {
          const next = lines[i + j].trim();
          if (!next || /resultado/i.test(next)) break;
          result.push(next);
          j++;
        }
        return result.join(" ");
      }
    }
    return "";
  }

  function extractNombreProyecto(lines: string[]) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes("nombre oficial del proyecto")) {
        for (let k = 0; k <= 2; k++) {
          const match = (lines[i + k] || "").match(/"([^"]+)"/);
          if (match) return match[1];
        }
        const result: string[] = [];
        let j = 1;
        while (i + j < lines.length && lines[i + j].trim() !== "1") {
          const next = lines[i + j].trim();
          if (next) result.push(next);
          j++;
        }
        return result.join(" ");
      }
    }
    return "";
  }

  function extractInstitucionSolicitante(lines: string[]) {
    const keyword = "nombre de la institución u organización solicitante";
    for (let i = 0; i < lines.length; i++) {
      const joined = (
        lines[i] +
        " " +
        (lines[i + 1] || "") +
        " " +
        (lines[i + 2] || "")
      )
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      if (joined.includes(keyword)) {
        let keywordLines = 1;
        let temp = lines[i].toLowerCase().replace(/\s+/g, " ").trim();
        while (keywordLines < 3 && !temp.includes("solicitante")) {
          keywordLines++;
          temp +=
            " " +
            (lines[i + keywordLines - 1] || "")
              .toLowerCase()
              .replace(/\s+/g, " ")
              .trim();
        }
        for (let j = 0; j < 2; j++) {
          const idx = (lines[i + j] || "").indexOf(":");
          if (idx !== -1 && (lines[i + j] || "").length > idx + 1) {
            let value = (lines[i + j] || "").substring(idx + 1).trim();
            if (value) return value;
          }
        }
        let j = keywordLines;
        while (i + j < lines.length) {
          const next = lines[i + j].trim();
          if (next) return next;
          j++;
        }
      }
    }
    return "";
  }

  function extractContrapartidaInstitucion(lines: string[]) {
    for (const line of lines) {
      const up = line.toUpperCase().replace(/\s+/g, " ").trim();
      if (up.startsWith("TOTAL")) {
        const norm = up.replace(/US\$[\s\d,\.]+/g, (m) =>
          m.replace(/[\s,]/g, "")
        );
        const m = norm.match(/US\$\d+(?:\.\d{2})?/g);
        if (m && m.length >= 1) return m[0];
      }
    }
    return "";
  }

  function extractCostoTotal(lines: string[]) {
    for (const line of lines) {
      const up = line.toUpperCase().replace(/\s+/g, " ").trim();
      if (up.startsWith("TOTAL")) {
        const norm = up.replace(/US\$[\s\d,\.]+/g, (m) =>
          m.replace(/[\s,]/g, "")
        );
        const m = norm.match(/US\$\d+(?:\.\d{2})?/g);
        if (m && m.length >= 2) return m[2];
      }
    }
    return "";
  }

  function extractContrapartidaCooperante(lines: string[]) {
    for (const line of lines) {
      const up = line.toUpperCase().replace(/\s+/g, " ").trim();
      if (up.startsWith("TOTAL")) {
        const norm = up.replace(/US\$[\s\d,\.]+/g, (m) =>
          m.replace(/[\s,]/g, "")
        );
        const m = norm.match(/US\$\d+(?:\.\d{2})?/g);
        if (m && m.length >= 2) return m[1];
      }
    }
    return "";
  }

  function extractResultado(lines: string[]) {
    let capturing = false;
    let found2 = false;
    const result: string[] = [];
    for (const raw of lines) {
      const line = raw.replace(/\s+/g, " ").trim();
      const low = line.toLowerCase();
      if (!capturing && /resultado\s*1\s*:/.test(low)) {
        capturing = true;
        result.push(raw.trim());
        continue;
      }
      if (capturing) {
        if (!line) {
          if (found2) break;
          continue;
        }
        if (/^resultado\s*2\s*:/.test(low)) {
          found2 = true;
          result.push(raw.trim());
          continue;
        }
        if (/^\d+(\.\d+)*\s*\./.test(line) && found2) break;
        result.push(line);
      }
    }
    return result.join(" ");
  }

  function extractDepartamento(lines: string[]) {
    const kw = "departamento:";
    const res: string[] = [];
    let cap = false;
    for (const l of lines) {
      const t = l.trim();
      if (!cap && t.toLowerCase().startsWith(kw)) {
        const after = l.substring(t.indexOf(kw) + kw.length).trim();
        if (after) res.push(after);
        cap = true;
        continue;
      }
      if (cap) {
        if (
          !t ||
          /^(cargo|tel\.|nombre|departamento|correo|email|dirección|teléfono|fax)/i.test(
            t
          )
        )
          break;
        res.push(t);
      }
    }
    return res.join(" ");
  }
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || file.type !== "application/pdf") {
    toast.warning("Por favor, selecciona un archivo PDF válido.");
    return;
  }

  if (!isPdfJsLoaded) {
    toast.error("PDF.js no está cargado todavía. Por favor espere.");
    return;
  }

  try {
    toast.info("Procesando PDF...", { autoClose: 2000 });
    
    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ 
      data: buffer,
      disableFontFace: true, // Improves performance
      verbosity: 0 // Reduces console output
    }).promise;

    let text = "";
    let pageTexts: string[] = [];

    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items and join with spaces
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      pageTexts.push(pageText);
      text += `${pageText}\n`;
    }

    setFullText(text);
    console.log("Texto completo extraído:", text); // Debug

    // Process extracted text
    const lines = text.split('\n').filter(line => line.trim() !== '');
    console.log("Líneas procesadas:", lines); // Debug

    // Update form fields
    setForm(prev => ({
      ...prev,
      institucionSolicitante: extractInstitucionSolicitante(lines) || prev.institucionSolicitante,
      nombreProyecto: extractNombreProyecto(lines) || prev.nombreProyecto,
      nombreActor: extractAfterKeyword("Nombre de la Fuente Cooperante", lines) || prev.nombreActor,
      objetivoGeneral: extractObjetivoGeneral(lines) || prev.objetivoGeneral,
      resultado: extractResultado(lines) || prev.resultado,
      departamento: extractDepartamento(lines) || prev.departamento,
      costoTotal: extractCostoTotal(lines) || prev.costoTotal,
      contrapartidaInstitucion: extractContrapartidaInstitucion(lines) || prev.contrapartidaInstitucion,
      contrapartidaCooperante: extractContrapartidaCooperante(lines) || prev.contrapartidaCooperante,
    }));

    // Set initial preview
    if (pageTexts.length > 0) {
      setOutputSnippet(pageTexts[0].substring(0, 500) + (pageTexts[0].length > 500 ? "..." : ""));
    }

    toast.success("PDF procesado correctamente", { autoClose: 3000 });

  } catch (error) {
    console.error("Error al procesar PDF:", error);
    toast.error(`Error al procesar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  } finally {
    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleFocus = (key: keyof typeof form) => {
    const value = form[key]?.trim();
    if (!value) {
      setOutputSnippet("No hay valor para mostrar.");
      return;
    }
    const idx = fullText.indexOf(value.slice(0, 50));
    setOutputSnippet(
      idx > -1
        ? fullText.substring(Math.max(0, idx - 100), idx + 300)
        : "No se encontró el fragmento en el texto original."
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBuscar = async () => {
    if (!form.NumeroDeProyecto) return;
    const res = await fetch(`/api/proyectos?NumProyecto=${form.NumeroDeProyecto}`);
    const data = await res.json();
    if (data && data.length > 0) {
      setEditingId(data[0].NumProyecto?.toString() || null);
      const p = data[0];
      setForm((prev) => ({
        ...prev,
        NumeroDeProyecto: p.NumProyecto?.toString() || "",
        nombreProyecto: p.NombreProyecto || "",
        institucionSolicitante: p.InstitucionSolicitante || "",
        nombreActor: p.NombreActor || "",
        actorDeCooperacion: p.ActorCooperacion || "",
        departamento: p.Dependencia || "",
        fechaAprobacion: formatDate(p.FechaAprovacion),
        etapaDeProyecto: p.EtapaProyecto || "",
        tipoDeProyecto: p.TipoProyecto || "",
        costoTotal: formatMoney(p.CostoTotal),
        contrapartidaInstitucion: formatMoney(p.ContrapartidaInstitucion),
        contrapartidaCooperante: formatMoney(p.ContrapartidaCooperante),
        documentos: p.Documentos || "",
        observaciones: p.Observaciones || "",
        objetivoGeneral: p.Objetivos || "",
        resultado: p.Resultados || "",
        tematicas: p.Tematicas || "",
        direccion: p.Direccion || "",
        ano: p.Ano?.toString() || "",
        areas: p.Areas || "",
        objetivos: p.Objetivos || "",
        resultados: p.Resultados || "",
        Region: p.Region || "",
      }));
    } else {
      alert("Proyecto no encontrado.");
    }
  };

  const handleGuardar = async () => {
    const confirm = window.confirm("¿Está seguro que desea guardar este proyecto?");
    if (!confirm) {
      toast.info("Guardado cancelado.");
      return;
    }

    const parseMoney = (val: string) => Number(val.replace(/[^0-9.]/g, "")) || 0;

    const finalArea = form.areas === "Otro" ? otherAreaValue : form.areas;

    const payload = {
      ActorCooperacion: form.actorDeCooperacion,
      InstitucionSolicitante: form.institucionSolicitante,
      NombreActor: form.nombreActor,
      NombreProyecto: form.nombreProyecto,
      FechaAprovacion: form.fechaAprobacion,
      EtapaProyecto: form.etapaDeProyecto,
      TipoProyecto: form.tipoDeProyecto,
      CostoTotal: parseMoney(form.costoTotal),
      ContrapartidaInstitucion: parseMoney(form.contrapartidaInstitucion),
      Documentos: form.documentos,
      Observaciones: form.observaciones,
      Objetivos: form.objetivoGeneral,
      Resultados: form.resultado,
      Dependencia: form.departamento,
      Ano: form.ano,
      ContrapartidaCooperante: parseMoney(form.contrapartidaCooperante),
      Areas: finalArea,
      Region: form.Region,
    };

    try {
      const res = await fetch("/api/proyectos", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...payload, NumProyecto: editingId } : payload),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success(
          editingId
            ? `Proyecto actualizado (N° ${form.NumeroDeProyecto})`
            : `Proyecto creado (N° ${result.insertId})`
        );
        if (!editingId && result.insertId) {
          setForm(prev => ({
            ...prev,
            NumeroDeProyecto: result.insertId.toString(),
          }));
          setEditingId(result.insertId.toString());
        }
      } else {
        throw new Error(result.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar el proyecto");
    }
  };

  const handleEliminar = async () => {
    if (!form.NumeroDeProyecto) {
      toast.error("No hay proyecto seleccionado para eliminar");
      return;
    }

    const confirm = window.confirm(
      `¿Está seguro que desea eliminar el proyecto N° ${form.NumeroDeProyecto}?`
    );
    if (!confirm) return;

    try {
      const res = await fetch(`/api/proyectos?NumProyecto=${form.NumeroDeProyecto}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Proyecto N° ${form.NumeroDeProyecto} eliminado`);
        setForm(initialFormState);
        setEditingId(null);
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el proyecto");
    }
  };

  const handleNuevo = () => {
    setEditingId(null);
    setForm(initialFormState);
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"
        strategy="beforeInteractive"
      />
      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
          <div className="flex items-end gap-2">
  <div className="flex-1">
    <label className="block text-sm font-semibold">
      Número de proyecto
    </label>
    <input
      name="NumeroDeProyecto"
      className="w-full border rounded p-2"
      value={form.NumeroDeProyecto}
      onChange={handleInputChange}
    />
  </div>
  <button
    type="button"
    className="bg-blue-500 text-white px-3 py-2 rounded"
    onClick={handleBuscar}
    title="Buscar proyecto"
  >
    Buscar
  </button>
  <button
    type="button"
    className="bg-gray-400 text-white px-3 py-2 rounded"
    onClick={handleNuevo}
    title="Limpiar formulario"
  >
    Limpiar
  </button>
  {/* {editingId && (
    <button
      type="button"
      className="bg-red-500 text-white px-3 py-2 rounded"
      onClick={handleEliminar}
      title="Eliminar proyecto"
    >
      Eliminar
    </button>
  )} */}
</div>
            <div>
              <label className="block text-sm font-semibold">
                Nombre de proyecto
              </label>
              <input
                name="nombreProyecto" 
                className="w-full border rounded p-2"
                value={form.nombreProyecto}
                onChange={handleInputChange}
                onFocus={() => handleFocus("nombreProyecto")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Institución solicitante
              </label>
              <input
                name="institucionSolicitante"
                className="w-full border rounded p-2"
                value={form.institucionSolicitante}
                onChange={handleInputChange}
                onFocus={() => handleFocus("institucionSolicitante")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Socio estratégico
              </label>
              <input
                name="nombreActor"
                className="w-full border rounded p-2"
                value={form.nombreActor}
                onChange={handleInputChange}
                onFocus={() => handleFocus("nombreActor")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Tipo de fuente
              </label>
              <select
                name="actorDeCooperacion"
                className="w-full border rounded p-2"
                value={form.actorDeCooperacion}
                onChange={handleInputChange}
              >
                <option value="">Seleccione</option>
                <option value="Bilateral">Bilateral</option>
                <option value="Multilateral">Multilateral</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Fecha de aprobación
              </label>
              <input
                name="fechaAprobacion"
                type="date"
                className="w-full border rounded p-2"
                value={form.fechaAprobacion}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Año</label>
              <select
                name="ano"
                className="w-full border rounded p-2"
                value={form.ano}
                onChange={handleInputChange}
              >
                <option value="Seleccione">Seleccione</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Objetivo general
              </label>
              <textarea
                name="objetivoGeneral"
                className="w-full border rounded p-2 min-h-[150px]"
                value={form.objetivoGeneral}
                onChange={(e) => {
                  handleInputChange(e);
                  handleAutoResize(e);
                }}
                style={{ resize: "vertical" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Contrapartida institución
              </label>
              <input
                name="contrapartidaInstitucion"
                className="w-full border rounded p-2"
                value={form.contrapartidaInstitucion}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Aporte cooperante
              </label>
              <input
                name="contrapartidaCooperante"
                className="w-full border rounded p-2"
                value={form.contrapartidaCooperante}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Costo total</label>
              <input
                name="costoTotal"
                className="w-full border rounded p-2"
                value={form.costoTotal}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Modalidad</label>
              <select
                name="tipoDeProyecto"
                className="w-full border rounded p-2"
                value={form.tipoDeProyecto}
                onChange={handleInputChange}
              >
                <option value="Seleccione">Seleccione</option>
                <option value="CooperaciónTecnica">Cooperación Técnica</option>
                <option value="Seleccione">Financiera reembolsable</option>
                <option value="Cooperación Financiera No Reembolsable">
                  Cooperación financiera no reembolsable
                </option>
              </select>
            </div>

            {/* dependencias debe de tener opcion multiple  */}
            <div>
              <label className="block text-sm font-semibold">
                Dependencias
              </label>
              <Select
                options={DIRECCION_OPTIONS}
                value={
                  DIRECCION_OPTIONS.find(
                    (opt) => opt.value === form.departamento
                  ) || null
                }
                onChange={(opt) =>
                  setForm((prev) => ({
                    ...prev,
                    departamento: opt ? opt.value : "",
                  }))
                }
                isClearable
                placeholder="Buscar dirección..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Áreas</label>
              <Select<AreaOption>
                options={AREAS_OPTIONS}
                value={selectedAreaOption}
                onChange={(option: AreaOption | null) => {
                  setSelectedAreaOption(option);
                  if (option?.value === "Otro") {
                    setForm((prev) => ({ ...prev, areas: "" }));
                  } else {
                    setForm((prev) => ({
                      ...prev,
                      areas: option?.value || "",
                    }));
                    setCustomArea("");
                  }
                }}
                isClearable
                placeholder="Seleccione área..."
                className="react-select-container"
                classNamePrefix="react-select"
              />

              {selectedAreaOption?.value === "Otro" && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Especifique el área"
                    className="w-full border rounded p-2"
                    value={customArea}
                    onChange={(e) => {
                      setCustomArea(e.target.value);
                      setForm((prev) => ({ ...prev, areas: e.target.value }));
                    }}
                  />
                </div>
              )}
            </div>
            <label className="block text-sm font-semibold">
              Etapa de proyecto
            </label>

            <select
              name="etapaDeProyecto"
              className="w-full border rounded p-2"
              value={form.etapaDeProyecto}
              onChange={handleInputChange}
            >
              <option value="">Seleccione</option>
              <option value="Formulación">Formulación</option>
              <option value="Implementación">Implementación</option>
              <option value="Negociación">Negociación</option>
              <option value="Aprobado">Aprobado</option>
              <option value="No aprobado">No aprobado</option>
              <option value="Rechazado por fuente externa">
                Rechazado por fuente externa
              </option>
              <option value="Suspendido por la fuente externa">
                Suspendido por la fuente externa
              </option>
              <option value="Finalización">Finalización</option>{" "}
            </select>

<div>
  <label className="block text-sm font-semibold">Región</label>
  <Select
    options={REGION_OPTIONS}
    value={REGION_OPTIONS.find(opt => opt.value === form.Region) || null}
    onChange={opt => setForm(prev => ({ ...prev, Region: opt ? opt.value : "" }))}
    isClearable
    placeholder="Seleccionar región..."
    className="react-select-container"
    classNamePrefix="react-select"
  />
</div>
       

            <div>
              <label className="block text-sm font-semibold">Documentos</label>
              <input
                name="documentos"
                className="w-full border rounded p-2"
                value={form.documentos}
                onChange={handleInputChange}
              />
            </div>

            {/*Esta parte es de tematica por ahora no es necesaria */}
            {/* <div>
              <label className="block text-sm font-semibold">Temáticas</label>
              <select
                name="tematicas"
                className="w-full border rounded p-2"
                value={form.tematicas}
                onChange={handleInputChange}
              >
                <option value="">Seleccione</option>

                <option value="Gestión de la calidad del MEP">Gestión de la calidad del MEP</option>
                <option value="Sana convivencia">Sana convivencia</option>
                <option value="Huertas escolares con pertinencia cultural">Huertas escolares con pertinencia cultural</option>
                <option value="Niños, niñas y jóvenes de origen extranjero en situación de movilidad. Interculturalidad">Niños, niñas y jóvenes de origen extranjero en situación de movilidad.Interculturalidad</option>
                <option value="Infraestructura educativa">Infraestructura educativa</option>
                <option value="Tranformación digital">Tranformación digital</option>
                <option value="Educación para el desarrollo sostenible">Educación para el desarrollo sostenible</option>
                <option value="Mejora de la calidad del sistema educativo costarricense">Mejora de la calidad del sistema educativo costarricense</option>
                <option value="Lectoescritura">Lectoescritura</option>
                <option value="Matemática">Matemática</option>
                <option value="Formación  profesional">Formación  profesional</option>
                <option value="Infraestructura educativa">Infraestructura educativa</option>
                <option value="Educación técnica">Educación técnica</option>
                <option value="Educación para el Desarrollo Sostenible">Educación para el Desarrollo Sostenible</option>
                <option value="Innovación y fortalecimiento en los aprendizajes">Innovación y fortalecimiento en los aprendizajes</option>
                <option value="Gestión educativa">Gestión educativa</option>
                
              </select>
            </div> */}

            <div>
              <label className="block text-sm font-semibold">Resultados</label>
              <textarea
                name="resultado"
                className="w-full border rounded p-2 min-h-[200px]"
                value={form.resultado}
                onChange={(e) => {
                  handleInputChange(e);
                  handleAutoResize(e);
                }}
                style={{ resize: "vertical" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                className="w-full border rounded p-2 min-h-[120px]"
                value={form.observaciones}
                onChange={(e) => {
                  handleInputChange(e);
                  handleAutoResize(e);
                }}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-2 mb-4">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleGuardar}
              >
                Guardar
              </button>

              <button
              
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleEliminar}
              >
                Eliminar
              </button>
              {/* Esta  parte se debe de arreglar es para que uno suba un PDF y los espacios se llenen automaticamente, antes servia y ahora no, debe ser algo simple pero ya me quede sin
              tiempo de TCU<label className="bg-gray-300 text-gray-800 px-4 py-2 rounded cursor-pointer text-center">
                Subir PDF
                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>  */}
            </div>

            {/*  Esta parte es que en el PDF que se inserto se pueda ver de donde saco la informacion que muestre como un extracto mas grande con contexto
            <div className="bg-gray-100 p-4 rounded shadow-sm overflow-auto h-full md:max-h-[500px] sticky top-6">
              <h2 className="text-lg font-semibold mb-2">Texto original</h2>
              <pre className="whitespace-pre-wrap text-sm">{outputSnippet}</pre>
            </div>  */}
          </div>
        </div>
      </div>
    </>
  );
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatMoney(n: any) {
  if (n === null || n === undefined || n === "") return "";
  return `US$${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;
}
