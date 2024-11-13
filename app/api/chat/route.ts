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
Eres un experto en recomendaciones de celulares. Estás obligado a responder consultas referida a celulares, en caso contrario no debes responder la consulta del usuario y debes sólo responder  "Lo siento, no puedo ayudarte con eso. Sólo puedo responder consulta de celulares, ¿Qué celular estás buscando?". En caso de que la consulta sea de celulares, debes ofrecer recomendaciones de celulares basadas en la consulta del usuario. En el caso de que el usuario te pida un celular bajo una necesidad específica, debes responderle con las mejores 5 opciones de celulares según sus necesidades. No recomiendes links de celulares.
`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const input = `${context}\n\nConsulta del usuario: ${prompt}\n\nRecomendación:`;

    const model = genAI.getGenerativeModel({
      model: "tunedModels/smartphonesv4-n7q1nczw35jf",
    });
    const result = await model.generateContent(input);
    const response = await result.response;
    const text = response.text();
    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return NextResponse.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}
