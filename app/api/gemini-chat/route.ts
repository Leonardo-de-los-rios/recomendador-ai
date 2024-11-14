import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Verificamos que la API key exista
if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY no está definida en las variables de entorno"
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const context = `
Eres un experto en recomendaciones de celulares. Solo responde preguntas relacionadas con telefonos celulares, como especificaciones, sistemas operativos, funciones, comparaciones entre modelos y recomendaciones de compra. Si recibes una pregunta que no este relacionada con celulares, responde con: "Lo siento, no puedo ayudarte con eso, sólo puedo responder consultas de celulares, ¿Qué celular estás buscando?".
En caso de que la consulta sea de celulares, debes ofrecer recomendaciones de celulares basadas en la consulta del usuario. En el caso de que el usuario te pida un celular bajo una necesidad específica, debes responderle con las mejores 5 opciones de celulares según sus necesidades. No recomiendes links de celulares. Cuando te pidan la recomendación de un celular, siempre debes responder en el siguiente formato:
Nombre del celular:
  - Descripción del celular: ...
  - Motivo de la recomendación: ...
`;

export async function POST(req: Request) {
  try {
    // Extraer tanto el prompt como el modelo del cuerpo de la petición
    const body = await req.json();
    const { prompt, model } = body;

    const input = `${context}\n\nConsulta del usuario: ${prompt}\n\nRecomendación:`;

    // Usar el modelo seleccionado por el usuario o el v4 por defecto
    const modelToUse = model || "tunedModels/smartphonesv4-n7q1nczw35jf";

    const genModel = genAI.getGenerativeModel({
      model: modelToUse,
    });

    const result = await genModel.generateContent(input);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      message: text,
      modelUsed: modelToUse, // Opcional: devolver el modelo usado para verificación
    });
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return NextResponse.json(
      {
        error: "Error procesando la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
