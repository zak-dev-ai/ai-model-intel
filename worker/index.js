export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      const data = await env.AI_MODELS_KV.get("pricing_data", "json");

      if (!data || !data.models) {
        return new Response(
          JSON.stringify({ error: "No data available" }),
          { status: 500 }
        );
      }

      const models = data.models;

      // -----------------------------------
      // ROOT → ALL MODELS (sorted cheapest)
      // -----------------------------------
      if (pathname === "/") {
        const sorted = [...models].sort(
          (a, b) => a.input_cost_per_mtok - b.input_cost_per_mtok
        );

        return new Response(JSON.stringify(sorted), {
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

        const requested = modelsParam
          .split(",")
          .map(m => m.trim().toLowerCase());

        const filtered = models.filter(m =>
          requested.includes(m.model.toLowerCase())
        );

        // 🔥 sort by BEST efficiency
        filtered.sort((a, b) => b.reasoning_efficiency - a.reasoning_efficiency);

        return new Response(JSON.stringify(filtered), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // -----------------------------------
      // PROVIDER → /models/openai
      // -----------------------------------
      if (pathname.startsWith("/models/")) {
        const provider = pathname.split("/")[2];

        const filtered = models.filter(
          m => m.provider.toLowerCase() === provider.toLowerCase()
        );

        return new Response(JSON.stringify(filtered), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // -----------------------------------
      // CHEAPEST → /cheapest?tier=mini
      // -----------------------------------
      if (pathname === "/cheapest") {
        const tier = url.searchParams.get("tier");

        if (!tier) {
          return new Response(
            JSON.stringify({ error: "Missing tier param" }),
            { status: 400 }
          );
        }

        const filtered = models.filter(m =>
          m.model.toLowerCase().includes(tier.toLowerCase())
        );

        if (!filtered.length) {
          return new Response(
            JSON.stringify({ error: "No models found" }),
            { status: 404 }
          );
        }

        const cheapest = filtered.reduce((a, b) =>
          a.input_cost_per_mtok < b.input_cost_per_mtok ? a : b
        );

        return new Response(JSON.stringify(cheapest), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // -----------------------------------
      // BEST VALUE → 🔥 YOUR UNIQUE FEATURE
      // /best
      // -----------------------------------
      if (pathname === "/best") {
        const sorted = [...models].sort(
          (a, b) => b.reasoning_efficiency - a.reasoning_efficiency
        );

        return new Response(JSON.stringify(sorted.slice(0, 5)), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // -----------------------------------
      // HEALTH
      // -----------------------------------
      if (pathname === "/health") {
        return new Response(
          JSON.stringify({
            status: "ok",
            total_models: models.length,
            last_updated: data.updated_at,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // -----------------------------------
      // NOT FOUND
      // -----------------------------------
      return new Response(
        JSON.stringify({
          error: "Route not found",
          endpoints: [
            "/",
            "/compare?models=a,b",
            "/models/{provider}",
            "/cheapest?tier=mini",
            "/best",
            "/health",
          ],
        }),
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
