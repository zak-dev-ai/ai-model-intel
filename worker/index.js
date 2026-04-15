export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // -----------------------------------
      // GET DATA FROM KV
      // -----------------------------------
      const data = await env.AI_MODELS_KV.get("pricing_data", "json");

      if (!data || !data.models) {
        return new Response(
          JSON.stringify({ error: "No data available" }),
          { status: 500 }
        );
      }

      // -----------------------------------
      // ROOT → ALL MODELS
      // -----------------------------------
      if (pathname === "/") {
        return new Response(JSON.stringify(data.models), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // -----------------------------------
      // COMPARE → /compare?models=gpt-4o,claude-3.5-sonnet
      // -----------------------------------
      if (pathname === "/compare") {
        const modelsParam = url.searchParams.get("models");

        if (!modelsParam) {
          return new Response(
            JSON.stringify({ error: "Missing models query param" }),
            { status: 400 }
          );
        }

        const requestedModels = modelsParam.split(",");

        const filtered = data.models.filter(m =>
          requestedModels.includes(m.model)
        );

        return new Response(JSON.stringify(filtered), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // -----------------------------------
      // HEALTH → /health
      // -----------------------------------
      if (pathname === "/health") {
        return new Response(
          JSON.stringify({
            status: "ok",
            total_models: data.models.length,
            last_updated: data.updated_at,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // -----------------------------------
      // NOT FOUND
      // -----------------------------------
      return new Response(
        JSON.stringify({ error: "Route not found" }),
        { status: 404 }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500 }
      );
    }
  },
};
