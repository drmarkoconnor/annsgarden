import "server-only";
import { getOpenAIEnv } from "@/lib/openai/env";

export type PlantIdentificationResult = {
  careSummary: string;
  commonName: string;
  confidence: "low" | "medium" | "high" | "unknown";
  confidenceNotes: string;
  cultivar: string;
  genus: string;
  identifyingFeatures: string[];
  latinName: string;
  plantType: string;
  rhsNotes: string;
  rhsSources: { title: string; url: string }[];
  species: string;
  suggestedPlantNotes: string;
  warnings: string[];
};

type IdentifyPlantInput = {
  areaName?: string;
  imageDataUrl: string;
  note?: string;
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "commonName",
    "latinName",
    "genus",
    "species",
    "cultivar",
    "plantType",
    "confidence",
    "confidenceNotes",
    "identifyingFeatures",
    "careSummary",
    "rhsNotes",
    "warnings",
    "suggestedPlantNotes",
    "rhsSources",
  ],
  properties: {
    commonName: { type: "string" },
    latinName: { type: "string" },
    genus: { type: "string" },
    species: { type: "string" },
    cultivar: { type: "string" },
    plantType: { type: "string" },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high", "unknown"],
    },
    confidenceNotes: { type: "string" },
    identifyingFeatures: {
      type: "array",
      items: { type: "string" },
    },
    careSummary: { type: "string" },
    rhsNotes: { type: "string" },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
    suggestedPlantNotes: { type: "string" },
    rhsSources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "url"],
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
      },
    },
  },
};

export async function identifyPlantFromImage(input: IdentifyPlantInput) {
  const { apiKey, model } = getOpenAIEnv();
  const body = requestBody(input, model, true);
  const response = await postResponse(apiKey, body).catch(async (error) => {
    if (error instanceof OpenAIRequestError && error.status >= 400 && error.status < 500) {
      return postResponse(apiKey, requestBody(input, model, false));
    }

    throw error;
  });
  const text = extractOutputText(response);

  if (!text) {
    throw new Error("OpenAI did not return an identification result.");
  }

  return {
    model,
    result: normaliseResult(JSON.parse(text)),
    raw: response,
  };
}

function requestBody(input: IdentifyPlantInput, model: string, includeWebSearch: boolean) {
  return {
    model,
    ...(model.startsWith("gpt-5") ? { reasoning: { effort: "low" } } : {}),
    ...(includeWebSearch
      ? {
          tools: [
            {
              type: "web_search",
              filters: {
                allowed_domains: ["rhs.org.uk"],
              },
            },
          ],
          tool_choice: "auto",
          include: ["web_search_call.action.sources"],
        }
      : {}),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: prompt(input),
          },
          {
            type: "input_image",
            image_url: input.imageDataUrl,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "plant_identification",
        strict: true,
        schema,
      },
    },
  };
}

async function postResponse(apiKey: string, body: unknown) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new OpenAIRequestError(response.status, await response.text());
  }

  return response.json() as Promise<OpenAIResponse>;
}

function prompt(input: IdentifyPlantInput) {
  const context = [
    "Ann's Garden is a private one-acre garden in North Somerset, near Bristol, England.",
    input.areaName ? `Garden area: ${input.areaName}.` : null,
    input.note ? `User note: ${input.note}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "Identify the plant in the image as a practical gardening assistant.",
    context,
    "Return a cautious suggestion for common name, Latin name, genus, species, cultivar if visible, plant type, confidence and visible identifying features.",
    "Give short UK garden care notes suitable for review before saving. If you use web search, prefer RHS pages and include RHS source URLs. If the image is not enough, say confidence is low and explain what detail would help.",
    "Do not diagnose pests or diseases unless the photo clearly shows them; add warnings for uncertainty, toxicity, handling, or verification needs.",
  ].join(" ");
}

type OpenAIResponse = {
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
    type?: string;
  }>;
  output_text?: string;
};

function extractOutputText(response: OpenAIResponse) {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (
        (content.type === "output_text" || content.type === "text") &&
        typeof content.text === "string"
      ) {
        return content.text;
      }
    }
  }

  return null;
}

function normaliseResult(value: unknown): PlantIdentificationResult {
  const record = isRecord(value) ? value : {};

  return {
    careSummary: text(record.careSummary),
    commonName: text(record.commonName),
    confidence: confidence(record.confidence),
    confidenceNotes: text(record.confidenceNotes),
    cultivar: text(record.cultivar),
    genus: text(record.genus),
    identifyingFeatures: stringArray(record.identifyingFeatures),
    latinName: text(record.latinName),
    plantType: text(record.plantType),
    rhsNotes: text(record.rhsNotes),
    rhsSources: sourceArray(record.rhsSources),
    species: text(record.species),
    suggestedPlantNotes: text(record.suggestedPlantNotes),
    warnings: stringArray(record.warnings),
  };
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => text(item)).filter(Boolean).slice(0, 8)
    : [];
}

function sourceArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = text(item.title);
      const url = text(item.url);
      return title && url ? { title, url } : null;
    })
    .filter((item): item is { title: string; url: string } => Boolean(item))
    .slice(0, 4);
}

function confidence(value: unknown): PlantIdentificationResult["confidence"] {
  return value === "low" || value === "medium" || value === "high" || value === "unknown"
    ? value
    : "unknown";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

class OpenAIRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
