import { NextResponse } from "next/server";

export function ok(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message, status = 500, details) {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status }
  );
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function validateBody(schema, body) {
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const fieldMessages = Object.entries(flattened.fieldErrors || {})
      .flatMap(([field, messages]) => (messages || []).map((message) => `${field}: ${message}`));

    return {
      success: false,
      response: fail(fieldMessages[0] || flattened.formErrors?.[0] || "Invalid request body", 400, flattened),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}
