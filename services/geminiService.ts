
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutPlan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const workoutPlanSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Um nome criativo e motivador para o plano de treino.' },
    description: { type: Type.STRING, description: 'Uma breve descrição do plano, explicando seu foco e objetivo.' },
    days: {
      type: Type.ARRAY,
      description: 'Uma lista de dias de treino.',
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: 'O identificador do dia de treino (Ex: "A", "B", "C" ou "Dia 1").' },
          focus: { type: Type.STRING, description: 'Os principais grupos musculares trabalhados neste dia.' },
          exercises: {
            type: Type.ARRAY,
            description: 'Uma lista de exercícios para este dia.',
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'O nome do exercício.' },
                sets: { type: Type.STRING, description: 'O número de séries (Ex: "4").' },
                reps: { type: Type.STRING, description: 'A faixa de repetições (Ex: "8-12" ou "Até a falha").' },
                rest: { type: Type.STRING, description: 'O tempo de descanso em segundos (Ex: "60").' },
                observation: { type: Type.STRING, description: 'Opcional. Uma dica ou observação sobre a execução do exercício.' },
              },
              required: ['name', 'sets', 'reps', 'rest'],
            },
          },
        },
        required: ['day', 'focus', 'exercises'],
      },
    },
  },
  required: ['name', 'description', 'days'],
};

export const generateWorkoutPlan = async (
  objective: string,
  level: string,
  daysPerWeek: number
): Promise<WorkoutPlan> => {
  const prompt = `
    Crie um plano de treino de musculação para uma pessoa com os seguintes detalhes:
    - Objetivo Principal: ${objective}
    - Nível de Experiência: ${level}
    - Dias disponíveis por semana: ${daysPerWeek}

    O plano deve ser bem estruturado, com uma divisão de treino lógica para os ${daysPerWeek} dias. 
    Para cada dia, forneça uma lista de 5 a 7 exercícios, incluindo nome, séries, repetições e tempo de descanso.
    Seja específico e use terminologia comum de academia.
    Retorne a resposta estritamente no formato JSON solicitado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: workoutPlanSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedPlan = JSON.parse(jsonText) as WorkoutPlan;
    return parsedPlan;

  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw new Error("Não foi possível gerar o plano de treino. Tente novamente.");
  }
};
