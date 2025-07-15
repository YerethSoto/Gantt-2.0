"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";

export default function PDFExtractor() {
  // State
  const [fullText, setFullText] = useState("");
  const [outputSnippet, setOutputSnippet] = useState(
    "Selecciona un campo para ver el origen"
  );
  const [form, setForm] = useState({
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
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load PDF.js worker from CDN once PDF.js script is available
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).pdfjsLib) {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
    }
  }, []);

  // All your extraction helpers:
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
        if (!t || /^(cargo|tel\.|nombre|departamento|correo|email|dirección|teléfono|fax)/i.test(t)) break;
        res.push(t);
      }
    }
    return res.join(" ");
  }

  // File → extract → set states
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Por favor, selecciona un archivo PDF válido.");
      return;
    }
    const buffer = await file.arrayBuffer();
    const pdf = await (window as any).pdfjsLib
      .getDocument({ data: buffer })
      .promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      let lastY: number | null = null,
        pageS = "";
      for (const it of tc.items as any[]) {
        if (
          lastY !== null &&
          Math.abs(it.transform[5] - lastY) > 2
        ) {
          pageS += "\n";
        }
        pageS += it.str + " ";
        lastY = it.transform[5];
      }
      text += `\n\n--- Page ${i} ---\n\n${pageS}`;
    }

    setFullText(text);
    const lines = text.split("\n");
    setForm((prev) => ({
      ...prev,
      nombreProyecto: extractNombreProyecto(lines),
      institucionSolicitante: extractInstitucionSolicitante(lines),
      nombreActor: extractAfterKeyword(
        "Nombre de la Fuente Cooperante",
        lines
      ),
      objetivoGeneral: extractObjetivoGeneral(lines),
      resultado: extractResultado(lines),
      departamento: extractDepartamento(lines),
      costoTotal: extractCostoTotal(lines),
      contrapartidaInstitucion: extractContrapartidaInstitucion(
        lines
      ),
      contrapartidaCooperante: extractContrapartidaCooperante(
        lines
      ),
    }));
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

  // Handle manual input for new fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"
        strategy="beforeInteractive"
      />
      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form fields (take 2/3 width on md+) */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-semibold">Número de proyecto</label>
              <input
                name="NumeroDeProyecto"
                className="w-full border rounded p-2"
                value={form.NumeroDeProyecto}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Nombre de proyecto</label>
              <input
                name="nombreProyecto" // <-- match state key exactly!
                className="w-full border rounded p-2"
                value={form.nombreProyecto}
                onChange={handleInputChange}
                onFocus={() => handleFocus("nombreProyecto")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Institución solicitante</label>
              <input
                name="institucionSolicitante"
                className="w-full border rounded p-2"
                value={form.institucionSolicitante}
                onChange={handleInputChange}
                onFocus={() => handleFocus("institucionSolicitante")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Nombre actor</label>
              <input
                name="nombreActor"
                className="w-full border rounded p-2"
                value={form.nombreActor}
                onChange={handleInputChange}
                onFocus={() => handleFocus("nombreActor")}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold">Actor de cooperación</label>
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
              <label className="block text-sm font-semibold">Dependencia</label>
              <input
                name="departamento"
                className="w-full border rounded p-2"
                value={form.departamento}
                onChange={handleInputChange}
                onFocus={() => handleFocus("departamento")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Fecha de aprovación</label>
              <input
                name="FechaAprobacion"
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
              <label className="block text-sm font-semibold">Objetivo general</label>
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
              <label className="block text-sm font-semibold">Contrapartida institución</label>
              <input
                name="contrapartidaInstitucion"
                className="w-full border rounded p-2"
                value={form.contrapartidaInstitucion}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Contrapartida cooperante</label>
              <input
                name="contrapartidaICooperante"
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
              <label className="block text-sm font-semibold">Tipo de Proyecto</label>
              <select
                name="tipoDeProyecto"
                className="w-full border rounded p-2"
                value={form.tipoDeProyecto}
                onChange={handleInputChange}
              >
                <option value="Seleccione">Seleccione</option>
                <option value="CooperaciónTecnica">Cooperación Técnica</option>
                <option value="Cooperación Financiera No Reembolsable">Cooperación Financiera No Reembolsable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">Áreas</label>
              <select
                name="areas"
                className="w-full border rounded p-2"
                value={form.areas}
                onChange={handleInputChange}
              >
                <option value="">Seleccione</option>
                <option value="Educación para el Desarrollo Sostenible">Educación para el Desarrollo Sostenible</option>
                <option value="Innovación y fortalecimiento en los aprendizajes">Innovación y fortalecimiento en los aprendizajes</option>
                <option value="Transformación digital">Transformación digital</option>
                <option value="Reforzamiento de los aprendizaje">Reforzamiento de los aprendizaje</option>
                <option value="Formación permanente">Formación permanente</option>
                <option value="Educación técnica profesional">Educación técnica profesional</option>
                <option value="Educación para el Desarrollo Sostenible">Educación para el Desarrollo Sostenible</option>
                <option value="Innovación y fortalecimiento en los aprendizajes">Innovación y fortalecimiento en los aprendizajes</option>
                <option value="Gestión educativa">Gestión educativa</option>
             
                
              </select>
            </div>



            <div>
              <label className="block text-sm font-semibold">Etapa del Proyecto</label>
              <select
                name="etapaDeProyecto"
                className="w-full border rounded p-2"
                value={form.etapaDeProyecto}
                onChange={handleInputChange}
              >
                <option value="">Seleccione</option>
                <option value="Implementacion">Implementación</option>
                <option value="Finalización">Finalización</option>
              </select>
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


            <div>
              <label className="block text-sm font-semibold">Dirección</label>
              <select
                name="direccion"
                className="w-full border rounded p-2"
                value={form.direccion}
                onChange={handleInputChange}
              >
                <option value="">Seleccione</option>
                <option value="Dirección de Gestión y Educación de la Calidad">Dirección de Gestión y Educación de la Calidad</option>
                <option value="Dirección de Vida Estudiantil">Dirección de Vida Estudiantil</option>
                <option value="Unidad de Coordinación Subsistema Educación Indígena">Unidad de Coordinación Subsistema Educación Indígena</option>
                <option value="Viceministerio de Planificación Institucional y Coordinación Regional">Viceministerio de Planificación Institucional y Coordinación Regional</option>
                <option value="Dirección de Recursos Tecnológicos en Educación">Dirección de Recursos Tecnológicos en Educación</option>
                <option value="Dirección de Desarrollo Curricular">Dirección de Desarrollo Curricular</option>
                <option value="Instituto de Desarrollo Profesional Ulasdilao Gámez Solano">Instituto de Desarrollo Profesional Ulasdilao Gámez Solano</option>
                <option value="Dirección de Infraestructura Educativa">Dirección de Infraestructura Educativa</option>
                <option value="Dirección de Educación Técnica y Capacidades Emprendedoras">Dirección de Educación Técnica y Capacidades Emprendedoras</option>



              </select>

            </div>

              <div>
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
            </div>


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
              <label className="block text-sm font-semibold">Observaciones</label>
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
            
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="mt-4"
            />
          </div>
          <div className="bg-gray-100 p-4 rounded shadow-sm overflow-auto h-full md:max-h-[500px] sticky top-6">
            <h2 className="text-lg font-semibold mb-2">
              Texto original
            </h2>
            <pre className="whitespace-pre-wrap text-sm">
              {outputSnippet}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}
