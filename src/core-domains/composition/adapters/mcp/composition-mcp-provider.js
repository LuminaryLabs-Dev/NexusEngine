import { defineMcpProvider } from "../../../mcp/index.js";
import { createCompositionApplyController } from "../../services/composition-apply-controller.js";
import { NEXUSENGINE_GUIDE_CHAPTERS } from "./generated-guide-resources.js";

const OPEN_OBJECT = Object.freeze({
  type: "object",
  additionalProperties: true
});
const STRING_ARRAY = Object.freeze({
  type: "array",
  items: { type: "string" }
});
const PAGE_PROPERTIES = Object.freeze({
  cursor: { type: "string" },
  limit: { type: "integer", minimum: 1, maximum: 100 },
  query: { type: "string" }
});
const COMPOSITION_REQUEST_PROPERTIES = Object.freeze({
  kits: STRING_ARRAY,
  domains: STRING_ARRAY,
  recipes: STRING_ARRAY,
  configs: { type: "object" },
  allowedStatuses: STRING_ARRAY,
  tree: { type: "object" },
  scopeNodeId: { type: "string" }
});

function wrappedOutputSchema(name, valueSchema = OPEN_OBJECT) {
  return Object.freeze({
    type: "object",
    required: [name],
    properties: { [name]: valueSchema },
    additionalProperties: false
  });
}

function pageOutputSchema(name) {
  return Object.freeze({
    type: "object",
    required: [name, "total", "nextCursor"],
    properties: {
      [name]: { type: "array", items: OPEN_OBJECT },
      total: { type: "integer", minimum: 0 },
      nextCursor: { type: ["string", "null"] }
    },
    additionalProperties: false
  });
}

function compositionRequest(input = {}) {
  return Object.fromEntries(
    Object.keys(COMPOSITION_REQUEST_PROPERTIES)
      .filter((key) => Object.prototype.hasOwnProperty.call(input, key))
      .map((key) => [key, input[key]])
  );
}

function includesQuery(record, query, values) {
  const text = String(query ?? "").trim().toLowerCase();
  return !text || values(record).some((value) => String(value ?? "").toLowerCase().includes(text));
}

function page(records, input = {}, key = "id") {
  const limit = input.limit == null ? 50 : Number(input.limit);
  const cursor = input.cursor == null ? null : String(input.cursor);
  let start = 0;
  if (cursor) {
    const index = records.findIndex((record) => String(record[key]) === cursor);
    if (index < 0) throw new RangeError(`Unknown pagination cursor: ${cursor}.`);
    start = index + 1;
  }
  const items = records.slice(start, start + limit);
  return {
    items,
    total: records.length,
    nextCursor: start + items.length < records.length
      ? String(items.at(-1)[key])
      : null
  };
}

function normalizeGuideChapters(value = []) {
  const chapters = (Array.isArray(value) ? value : []).map((chapter, index) => {
    const id = String(chapter?.id ?? "").trim();
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(id)) {
      throw new TypeError(`Guide chapter ${index} requires a stable id.`);
    }
    const markdown = String(chapter.markdown ?? chapter.content ?? "");
    return [id, Object.freeze({
      id,
      title: String(chapter.title ?? id),
      contentHash: chapter.contentHash == null ? null : String(chapter.contentHash),
      markdown
    })];
  });
  if (new Set(chapters.map(([id]) => id)).size !== chapters.length) {
    throw new TypeError("Guide chapters contain duplicate ids.");
  }
  return new Map(chapters);
}

function requireRecord(value, label, id) {
  if (!value) throw new RangeError(`Unknown ${label}: ${id}.`);
  return value;
}

export function createCompositionMcpProvider(options = {}) {
  const composition = options.composition;
  if (!composition?.registry || !composition?.planning || !composition?.capabilities) {
    throw new TypeError("Composition MCP provider requires the Core Composition API.");
  }
  const controller = options.controller ?? createCompositionApplyController({
    composition,
    host: options.host,
    initialSnapshot: options.initialSnapshot,
    persist: options.persist
  });
  const guideChapters = normalizeGuideChapters(options.guideChapters ?? NEXUSENGINE_GUIDE_CHAPTERS);

  function validateComposition(input = {}) {
    const request = compositionRequest(input);
    try {
      const validation = request.tree
        ? composition.planning.planTree(request.tree, {
          ...(request.scopeNodeId ? { scopeNodeId: request.scopeNodeId } : {})
        })
        : composition.planning.validate({
          kits: request.kits,
          domains: request.domains,
          recipes: request.recipes
        }, {
          ...(request.allowedStatuses ? { allowedStatuses: request.allowedStatuses } : {})
        });
      return {
        ok: validation.ok === true,
        validation,
        registryContentHash: composition.registry.getSnapshot().contentHash,
        errors: validation.ok ? [] : [
          ...validation.missing.map((entry) => ({ code: entry.reason ?? "missing", ...entry })),
          ...validation.rejected.map((entry) => ({ code: entry.reason ?? "rejected", ...entry })),
          ...validation.cycles.map((cycle) => ({ code: "cycle", cycle }))
        ]
      };
    } catch (error) {
      return {
        ok: false,
        validation: null,
        registryContentHash: composition.registry.getSnapshot().contentHash,
        errors: [{ code: "invalid-request", message: String(error.message ?? error) }]
      };
    }
  }

  const provider = defineMcpProvider({
    id: options.id ?? "nexusengine-composition",
    version: options.version ?? "0.0.4",
    metadata: {
      applicationOwned: true,
      optIn: true,
      mutationTool: "composition_apply",
      registryContentHash: composition.registry.getSnapshot().contentHash
    },
    tools: [
      {
        name: "domains_list",
        description: "List the active deterministic Core Composition Domain catalog.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: wrappedOutputSchema("domains", { type: "array", items: OPEN_OBJECT }),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ query = "" }) {
          const domains = composition.registry.listDomains().filter((domain) => includesQuery(domain, query, (entry) => [
            entry.id,
            entry.domainPath,
            entry.label,
            ...entry.ownedMeaning
          ]));
          return { domains };
        }
      },
      {
        name: "domain_get",
        description: "Read one Domain record by stable registry id.",
        inputSchema: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: wrappedOutputSchema("domain"),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ id }) {
          return { domain: requireRecord(composition.registry.getDomain(id), "Domain", id) };
        }
      },
      {
        name: "kits_list",
        description: "List active Kit records, optionally filtered by Domain or text.",
        inputSchema: {
          type: "object",
          properties: {
            domainId: { type: "string" },
            domainPath: { type: "string" },
            query: { type: "string" }
          },
          additionalProperties: false
        },
        outputSchema: wrappedOutputSchema("kits", { type: "array", items: OPEN_OBJECT }),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ domainId, domainPath, query = "" }) {
          const domain = domainId
            ? requireRecord(composition.registry.getDomain(domainId), "Domain", domainId)
            : null;
          const selectedPath = domainPath ?? domain?.domainPath ?? null;
          const kits = composition.registry.listKits().filter((kit) => {
            const inDomain = !selectedPath
              || kit.domainPath === selectedPath
              || kit.domainPath.startsWith(`${selectedPath}:`);
            return inDomain && includesQuery(kit, query, (entry) => [
              entry.id,
              entry.domainPath,
              ...entry.requires,
              ...entry.provides
            ]);
          });
          return { kits };
        }
      },
      {
        name: "kit_explain",
        description: "Explain one Kit's providers, requirements, dependents, and missing capabilities.",
        inputSchema: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: wrappedOutputSchema("explanation"),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ id }) {
          return { explanation: requireRecord(composition.capabilities.explainKit(id), "Kit", id) };
        }
      },
      {
        name: "atoms_list",
        description: "List atomic Core and registry Kits with stable cursor pagination.",
        inputSchema: {
          type: "object",
          properties: { ...PAGE_PROPERTIES, domainPath: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: pageOutputSchema("atoms"),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler(input) {
          const records = composition.registry.listKits().filter((kit) => {
            const inDomain = !input.domainPath
              || kit.domainPath === input.domainPath
              || kit.domainPath.startsWith(`${input.domainPath}:`);
            return inDomain && includesQuery(kit, input.query, (entry) => [
              entry.id,
              entry.responsibility,
              entry.domainPath,
              ...entry.requires,
              ...entry.provides
            ]);
          });
          const result = page(records, input);
          return { atoms: result.items, total: result.total, nextCursor: result.nextCursor };
        }
      },
      {
        name: "atom_get",
        description: "Read one atomic Kit and its dependency explanation.",
        inputSchema: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: Object.freeze({
          type: "object",
          required: ["atom", "explanation"],
          properties: { atom: OPEN_OBJECT, explanation: OPEN_OBJECT },
          additionalProperties: false
        }),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ id }) {
          return {
            atom: requireRecord(composition.registry.getKit(id), "atom", id),
            explanation: requireRecord(composition.capabilities.explainKit(id), "atom", id)
          };
        }
      },
      {
        name: "recipes_list",
        description: "List composition recipes with stable cursor pagination.",
        inputSchema: {
          type: "object",
          properties: PAGE_PROPERTIES,
          additionalProperties: false
        },
        outputSchema: pageOutputSchema("recipes"),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler(input) {
          const records = composition.registry.listRecipes().filter((recipe) => includesQuery(recipe, input.query, (entry) => [
            entry.id,
            entry.label,
            ...entry.domains,
            ...entry.kits
          ]));
          const result = page(records, input);
          return { recipes: result.items, total: result.total, nextCursor: result.nextCursor };
        }
      },
      {
        name: "recipe_get",
        description: "Read one composition recipe by stable registry id.",
        inputSchema: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: wrappedOutputSchema("recipe"),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler({ id }) {
          return { recipe: requireRecord(composition.registry.getRecipe(id), "recipe", id) };
        }
      },
      {
        name: "registry_sources_list",
        description: "List immutable registry sources, integrity, environments, permissions, and status.",
        inputSchema: {
          type: "object",
          properties: { ...PAGE_PROPERTIES, status: { type: "string" }, environment: { type: "string" } },
          additionalProperties: false
        },
        outputSchema: pageOutputSchema("sources"),
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler(input) {
          const records = composition.registry.listSources().filter((source) => {
            const statusMatches = !input.status || source.status === input.status;
            const environmentMatches = !input.environment || source.environments.includes(input.environment);
            return statusMatches && environmentMatches && includesQuery(source, input.query, (entry) => [
              entry.registryId,
              entry.package,
              entry.version,
              entry.sourceCommit,
              entry.integrity,
              entry.status,
              ...entry.environments,
              ...entry.permissions
            ]);
          });
          const result = page(records, input, "registryId");
          return { sources: result.items, total: result.total, nextCursor: result.nextCursor };
        }
      },
      {
        name: "composition_validate",
        description: "Validate dependencies, status policy, cycles, and registry identity without resolving or applying code.",
        inputSchema: {
          type: "object",
          properties: COMPOSITION_REQUEST_PROPERTIES,
          additionalProperties: false
        },
        outputSchema: OPEN_OBJECT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler: validateComposition
      },
      {
        name: "composition_plan",
        description: "Resolve and preflight a deterministic composition without mutating the host.",
        inputSchema: {
          type: "object",
          properties: COMPOSITION_REQUEST_PROPERTIES,
          additionalProperties: false
        },
        outputSchema: OPEN_OBJECT,
        annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
        handler(input, context) {
          return controller.prepare(compositionRequest(input), context);
        }
      },
      {
        name: "composition_apply",
        description: "Apply the exact reviewed composition plan through the trusted application host.",
        approval: "required",
        inputSchema: {
          type: "object",
          required: ["expectedPlanId"],
          properties: {
            expectedPlanId: { type: "string" },
            ...COMPOSITION_REQUEST_PROPERTIES
          },
          additionalProperties: false
        },
        outputSchema: OPEN_OBJECT,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        },
        handler(input, context) {
          return controller.apply(compositionRequest(input), {
            expectedPlanId: input.expectedPlanId,
            context
          });
        }
      }
    ],
    resources: [
      {
        name: "composition-apply-receipts",
        uri: "nexus-composition://receipts",
        title: "Composition Apply Receipts",
        description: "Persistent exactly-once composition receipts owned by this application host.",
        read: () => controller.getSnapshot()
      },
      {
        name: "composition-registry",
        uri: "nexus-composition://registry",
        title: "Composition Registry",
        description: "The complete merged metadata registry. Reading it never executes Kit code.",
        read: () => composition.registry.getSnapshot()
      },
      {
        name: "nexusengine-guide-chapters",
        uri: "nexus-guide://chapters",
        title: "NexusEngine Guide Chapters",
        description: "Chapter index only. Read one chapter through the chapter resource template.",
        read: () => ({
          chapters: [...guideChapters.values()].map(({ markdown, ...chapter }) => chapter)
        })
      }
    ],
    resourceTemplates: [
      {
        name: "composition-domain-record",
        uriTemplate: "nexus-composition://registry/domains/{id}",
        title: "Composition Domain Record",
        description: "One immutable merged Domain registry record.",
        read: ({ parameters }) => requireRecord(composition.registry.getDomain(parameters.id), "Domain", parameters.id)
      },
      {
        name: "composition-atom-record",
        uriTemplate: "nexus-composition://registry/atoms/{id}",
        title: "Composition Atom Record",
        description: "One immutable merged atomic Kit registry record.",
        read: ({ parameters }) => requireRecord(composition.registry.getKit(parameters.id), "atom", parameters.id)
      },
      {
        name: "composition-recipe-record",
        uriTemplate: "nexus-composition://registry/recipes/{id}",
        title: "Composition Recipe Record",
        description: "One immutable merged composition recipe.",
        read: ({ parameters }) => requireRecord(composition.registry.getRecipe(parameters.id), "recipe", parameters.id)
      },
      {
        name: "composition-source-record",
        uriTemplate: "nexus-composition://registry/sources/{id}",
        title: "Composition Registry Source",
        description: "One immutable registry source identity and integrity record.",
        read: ({ parameters }) => requireRecord(
          composition.registry.listSources().find((source) => source.registryId === parameters.id),
          "registry source",
          parameters.id
        )
      },
      {
        name: "nexusengine-guide-chapter",
        uriTemplate: "nexus-guide://chapters/{id}",
        title: "NexusEngine Guide Chapter",
        description: "One Markdown guide chapter. The full guide is never injected into a prompt.",
        mimeType: "text/markdown",
        read: ({ parameters }) => requireRecord(guideChapters.get(parameters.id), "guide chapter", parameters.id).markdown
      }
    ],
    prompts: [
      {
        name: "inspect-and-plan",
        title: "Inspect And Plan",
        description: "Inspect only the relevant registry records, validate the request, and produce a reviewable plan.",
        arguments: [{ name: "objective", description: "The composition outcome to plan.", required: true }],
        render({ objective }) {
          return `Objective: ${objective}\nUse domains_list, atoms_list, atom_get, recipes_list, registry_sources_list, and composition_validate to inspect only relevant records. Then call composition_plan. Report the plan id, exact source commits, SHA-256 integrity, environments, permissions, and capability changes. Do not call composition_apply.`;
        }
      },
      {
        name: "review-and-apply",
        title: "Review And Apply",
        description: "Review an exact plan tuple and request approval before applying it once.",
        arguments: [{ name: "expectedPlanId", description: "The exact reviewed plan id.", required: true }],
        render({ expectedPlanId }) {
          return `Review plan ${expectedPlanId}. Re-run composition_plan with the unchanged request and stop if the plan id differs. Show source, commit, integrity, environments, permissions, and capability changes. Call composition_apply only after explicit human approval for that exact plan id.`;
        }
      }
    ]
  });

  return provider;
}

export default createCompositionMcpProvider;
