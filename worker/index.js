export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const data = await env.AI_MODELS.get("pricing_data", { type: "json" });

    if (!data) {
      return new Response("No data", { status: 500 });
    }

    const models = data.models;

    // -------------------------------
    // ROOT
    // -------------------------------
    if (path === "/") {
      return Response.json({
        name: "AI Model Intel API",
        version: "v1",
        endpoints: [
          "/models",
          "/compare?models=gpt-4o,claude-3.5-sonnet"
        ]
      });
    }

    // -------------------------------
    // ALL MODELS
    // -------------------------------
    if (path === "/models") {
      return Response.json(models);
    }

    // -------------------------------
    // COMPARE
    // -------------------------------
    if (path === "/compare") {
      const query = url.searchParams.get("models");

      if (!query) {
        return new Response("Missing models param", { status: 400 });
      }

      const requested = query.split(",");

      const result = models.filter(m =>
        requested.includes(m.model)
      );

      return Response.json(result);
    }

    // -------------------------------
    // NOT FOUND
    // -------------------------------
    return new Response("Not found", { status: 404 });
  }
};
