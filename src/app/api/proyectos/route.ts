import { NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const numProyecto = searchParams.get("NumProyecto");

  try {
    let proyectos;
    if (numProyecto) {
      proyectos = await query(
        `SELECT * FROM proyecto WHERE NumProyecto = ?`,
        [numProyecto]
      );
    } else {
      proyectos = await query(`SELECT * FROM proyecto`);
    }
    return NextResponse.json(proyectos);
  } catch (error) {
    console.error("Error obteniendo proyectos:", error);
    return NextResponse.json({ error: "Error al obtener proyectos" }, { status: 500 });
  }
}

// POST: Insert a new proyecto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      ActorCooperacion,
      InstitucionSolicitante,
      NombreActor,
      NombreProyecto,
      FechaAprovacion,
      EtapaProyecto,
      TipoProyecto,
      CostoTotal,
      ContrapartidaInstitucion,
      Documentos,
      Observaciones,
      Objetivos,
      Resultados,
      Tematicas,
      Dependencia,
      Ano,
      ContrapartidaCooperante,
      Areas,
      NumProyecto, // <-- include this if you want to allow client to specify
    } = body;

    const result = await query(
      `INSERT INTO proyecto (
        NumProyecto, ActorCooperacion, InstitucionSolicitante, NombreActor, NombreProyecto, FechaAprovacion, EtapaProyecto, TipoProyecto, CostoTotal,
        ContrapartidaInstitucion, Documentos, Observaciones, Objetivos, Resultados, Tematicas, Dependencia, Ano,
        ContrapartidaCooperante, Areas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        ActorCooperacion=VALUES(ActorCooperacion),
        InstitucionSolicitante=VALUES(InstitucionSolicitante),
        NombreActor=VALUES(NombreActor),
        NombreProyecto=VALUES(NombreProyecto),
        FechaAprovacion=VALUES(FechaAprovacion),
        EtapaProyecto=VALUES(EtapaProyecto),
        TipoProyecto=VALUES(TipoProyecto),
        CostoTotal=VALUES(CostoTotal),
        ContrapartidaInstitucion=VALUES(ContrapartidaInstitucion),
        Documentos=VALUES(Documentos),
        Observaciones=VALUES(Observaciones),
        Objetivos=VALUES(Objetivos),
        Resultados=VALUES(Resultados),
        Tematicas=VALUES(Tematicas),
        Dependencia=VALUES(Dependencia),
        Ano=VALUES(Ano),
        ContrapartidaCooperante=VALUES(ContrapartidaCooperante),
        Areas=VALUES(Areas)
      `,
      [
        NumProyecto || null, // If null, DB will auto-increment
        ActorCooperacion,
        InstitucionSolicitante,
        NombreActor,
        NombreProyecto,
        FechaAprovacion,
        EtapaProyecto,
        TipoProyecto,
        CostoTotal,
        ContrapartidaInstitucion,
        Documentos,
        Observaciones,
        Objetivos,
        Resultados,
        Tematicas,
        Dependencia,
        Ano,
        ContrapartidaCooperante,
        Areas,
      ]
    );

    return NextResponse.json(
      { message: "Proyecto guardado o actualizado correctamente", insertId: result.insertId?.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error insertando/actualizando proyecto:", error);
    return NextResponse.json({ error: "Error al guardar proyecto" }, { status: 500 });
  }
}

// PUT: Update an existing proyecto
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      NumProyecto,
      ActorCooperacion,
      InstitucionSolicitante,
      NombreActor,
      NombreProyecto,
      FechaAprovacion,
      EtapaProyecto,
      TipoProyecto,
      CostoTotal,
      ContrapartidaInstitucion,
      Documentos,
      Observaciones,
      Objetivos,
      Resultados,
      Tematicas,
      Dependencia,
      Ano,
      ContrapartidaCooperante,
      Areas,
    } = body;

    if (!NumProyecto) {
      return NextResponse.json({ error: "NumProyecto requerido para actualizar" }, { status: 400 });
    }

    await query(
      `UPDATE proyecto SET
        ActorCooperacion=?, InstitucionSolicitante=?, NombreActor=?, NombreProyecto=?, FechaAprovacion=?, EtapaProyecto=?, TipoProyecto=?, CostoTotal=?,
        ContrapartidaInstitucion=?, Documentos=?, Observaciones=?, Objetivos=?, Resultados=?, Tematicas=?, Dependencia=?, Ano=?, ContrapartidaCooperante=?, Areas=?
      WHERE NumProyecto=?`,
      [
        ActorCooperacion,
        InstitucionSolicitante,
        NombreActor,
        NombreProyecto,
        FechaAprovacion,
        EtapaProyecto,
        TipoProyecto,
        CostoTotal,
        ContrapartidaInstitucion,
        Documentos,
        Observaciones,
        Objetivos,
        Resultados,
        Tematicas,
        Dependencia,
        Ano,
        ContrapartidaCooperante,
        Areas,
        NumProyecto,
      ]
    );

    return NextResponse.json({ message: "Proyecto actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando proyecto:", error);
    return NextResponse.json({ error: "Error al actualizar proyecto" }, { status: 500 });
  }
}