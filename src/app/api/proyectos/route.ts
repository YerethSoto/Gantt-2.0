import { NextResponse } from "next/server";
import { query } from "@/lib/mariadb";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const numProyecto = searchParams.get("NumProyecto");
    
    if (!numProyecto) {
      return NextResponse.json(
        { error: "NumProyecto requerido" }, 
        { status: 400 }
      );
    }

    await query(
      `DELETE FROM proyecto WHERE NumProyecto = ?`,
      [numProyecto]
    );

    return NextResponse.json(
      { message: "Proyecto eliminado correctamente" }
    );
  } catch (error) {
    console.error("Error eliminando proyecto:", error);
    return NextResponse.json(
      { error: "Error al eliminar proyecto" }, 
      { status: 500 }
    );
  }
}


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
    
    const result = await query(
      `INSERT INTO proyecto (
        ActorCooperacion, InstitucionSolicitante, NombreActor, 
        NombreProyecto, FechaAprovacion, EtapaProyecto, 
        TipoProyecto, CostoTotal, ContrapartidaInstitucion,
        Documentos, Observaciones, Objetivos, Resultados,
        Tematicas, Dependencia, Ano, ContrapartidaCooperante,
        Areas, Region
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.ActorCooperacion,
        body.InstitucionSolicitante,
        body.NombreActor,
        body.NombreProyecto,
        body.FechaAprovacion,
        body.EtapaProyecto,
        body.TipoProyecto,
        body.CostoTotal,
        body.ContrapartidaInstitucion,
        body.Documentos,
        body.Observaciones,
        body.Objetivos,
        body.Resultados,
        body.Tematicas,
        body.Dependencia,
        body.Ano,
        body.ContrapartidaCooperante,
        body.Areas,
        body.Region
      ]
    );

    // Convert BigInt to string
    const insertId = result.insertId.toString();

    return NextResponse.json(
      { 
        message: "Proyecto creado",
        insertId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error al crear proyecto" },
      { status: 500 }
    );
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
      Region,
    } = body;

    if (!NumProyecto) {
      return NextResponse.json({ error: "NumProyecto requerido para actualizar" }, { status: 400 });
    }

    await query(
      `UPDATE proyecto SET
        ActorCooperacion=?, InstitucionSolicitante=?, NombreActor=?, NombreProyecto=?, FechaAprovacion=?, EtapaProyecto=?, TipoProyecto=?, CostoTotal=?,
        ContrapartidaInstitucion=?, Documentos=?, Observaciones=?, Objetivos=?, Resultados=?, Tematicas=?, Dependencia=?, Ano=?, ContrapartidaCooperante=?, Areas=?, Region=?
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
        Region,
        NumProyecto,
      ]
    );

    return NextResponse.json({ message: "Proyecto actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando proyecto:", error);
    return NextResponse.json({ error: "Error al actualizar proyecto" }, { status: 500 });
  }



}