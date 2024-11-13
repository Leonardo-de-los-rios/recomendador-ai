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
Eres un experto en recomendaciones de celulares. 
Cada vez que recibas una consulta, debes responder con una lista de los 5 mejores celulares 
que se ajusten a las necesidades especificadas en la consulta. 
Incluye solo el modelo y una breve descripción de por qué es adecuado.
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
