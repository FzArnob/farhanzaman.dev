import type { Expertise, Project } from '../types/profile';

/**
 * The expertise lattice's edges are real data, not decoration.
 *
 * Two independent sources already sit in profile.json and neither was put there for
 * this purpose:
 *
 *   1. 17 of the 23 expertise descriptions name the projects they were used in —
 *      "Used in Space Ninja and Tribel", "Integral in Pocketalk Ventana, CovidEase…".
 *   2. Every project carries a `tech_stack` list.
 *
 * Cross-reference the two and you get a genuine co-occurrence graph: Java, Spring Boot
 * and SQL light up together because Pocketalk Ventana binds them. A tag cloud has no
 * way to say "these two things go together"; this does, and it needs no new data entry.
 */

export interface GraphNode {
  id: string;
  name: string;
  level: string;
  /** Months. */
  duration: number;
  description: string;
  /** Projects this expertise is attached to, by project_id. */
  projects: string[];
  /** Node radius weight, 0..1, from duration. */
  weight: number;
  /** Emission weight, 0..1, from level. */
  glow: number;
}

export interface GraphEdge {
  a: number;
  b: number;
  /** How many projects the two share. */
  shared: number;
  projects: string[];
}

export interface ExpertiseGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Adjacency, for lighting up a node's neighbours on click. */
  neighbours: number[][];
}

const LEVEL_GLOW: Record<string, number> = {
  beginner: 0.3,
  basic: 0.3,
  intermediate: 0.62,
  advanced: 1,
};

/**
 * Aliases for the ways a project is written in prose versus its `name` field —
 * "Simba(CSA)" is referred to as "Simba (CSA)" and "Simba", "C Academy TMS" as "TMS".
 */
const PROJECT_ALIASES: Record<string, string[]> = {
  'Simba(CSA)': ['Simba (CSA)', 'Simba(CSA)', 'Simba'],
  'C Academy TMS': ['C Academy TMS', 'C Academy', 'TMS'],
  'Pocketalk Ventana': ['Pocketalk Ventana', 'Pocketalk'],
};

/** Normalises "Node JS" / "NodeJS" / "node js" to one comparable token. */
function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#]/g, '');
}

/**
 * Tech-stack entries are written loosely, so a strict equality match would miss most
 * of them. These are the pairs that need help beyond normalisation.
 */
const TECH_SYNONYMS: Record<string, string[]> = {
  nodejs: ['nodejs'],
  reactjs: ['reactjs'],
  springboot: ['springboot'],
  javascript: ['javascript', 'jscript'],
  java: ['java'],
  javaee: ['javaee', 'springsecurity', 'jpa', 'hibernateorm', 'javaaop'],
  mysql: ['mysql', 'sql'],
  nosql: ['nosql', 'gcpfirestore', 'awsdynamodb', 'firebase'],
  graphql: ['graphql', 'awsappsync'],
  oop: ['oop'],
  css: ['css', 'vanilacsslibrary'],
  html: ['html'],
  typescript: ['typescript'],
  python: ['python', 'pandas', 'torch', 'transformerslib'],
  mongodb: ['mongodb'],
  redux: ['redux'],
  jquery: ['jquery'],
  selenium: ['selenium'],
  php: ['php'],
};

function techMatches(expertiseName: string, stackTokens: Set<string>): boolean {
  const key = normalise(expertiseName);
  if (stackTokens.has(key)) return true;
  const synonyms = TECH_SYNONYMS[key];
  if (!synonyms) return false;
  return synonyms.some((s) => stackTokens.has(s));
}

export function buildExpertiseGraph(expertises: Expertise[], projects: Project[]): ExpertiseGraph {
  const stackByProject = new Map<string, Set<string>>();
  for (const project of projects) {
    const tokens = new Set(
      String(project.tech_stack || '')
        .split(',')
        .map((s) => normalise(s))
        .filter(Boolean)
    );
    stackByProject.set(project.project_id, tokens);
  }

  const nodes: GraphNode[] = expertises.map((expertise) => {
    const linked = new Set<string>();

    // Source 1: the description names the project outright.
    for (const project of projects) {
      const names = PROJECT_ALIASES[project.name] ?? [project.name];
      if (names.some((n) => expertise.description.includes(n))) linked.add(project.project_id);
    }
    // Source 2: the project's own tech_stack claims this expertise.
    for (const project of projects) {
      const tokens = stackByProject.get(project.project_id)!;
      if (techMatches(expertise.name, tokens)) linked.add(project.project_id);
    }

    const duration = Number(expertise.duration) || 0;
    return {
      id: expertise.expertise_id,
      name: expertise.name,
      level: expertise.level,
      duration,
      description: expertise.description,
      projects: [...linked],
      // 3–48 months across the data; sqrt keeps the long tail from dominating.
      weight: Math.sqrt(Math.min(duration, 48) / 48),
      glow: LEVEL_GLOW[expertise.level.toLowerCase()] ?? 0.5,
    };
  });

  const edges: GraphEdge[] = [];
  const neighbours: number[][] = nodes.map(() => []);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = nodes[i].projects.filter((p) => nodes[j].projects.includes(p));
      if (shared.length === 0) continue;
      edges.push({ a: i, b: j, shared: shared.length, projects: shared });
      neighbours[i].push(j);
      neighbours[j].push(i);
    }
  }

  return { nodes, edges, neighbours };
}

/** Project names for a node, for the DOM panel. */
export function projectNames(node: GraphNode, projects: Project[]): string[] {
  return node.projects
    .map((id) => projects.find((p) => p.project_id === id)?.name)
    .filter((n): n is string => Boolean(n));
}
