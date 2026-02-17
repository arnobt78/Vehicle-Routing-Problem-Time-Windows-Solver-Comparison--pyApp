/**
 * Returns a short educational description for a Solomon benchmark instance name.
 * C101–C109: C-Type, Clustered, narrow windows
 * C201–C208: C-Type, Clustered, wide windows
 * R101–R112: R-Type, Random, narrow windows
 * R201–R211: R-Type, Random, wide windows
 * RC101–RC108: RC-Type, Mixed, narrow windows
 * RC201–RC208: RC-Type, Mixed, wide windows
 */
export type InstanceMeta = {
  group: "C-Type" | "R-Type" | "RC-Type";
  distribution: "Clustered" | "Random" | "Mixed";
  windows: "Narrow Windows" | "Wide Windows";
  category: "Type-1" | "Type-2";
  description: string;
};

export function getInstanceMeta(name: string): InstanceMeta | null {
  const n = name.toLowerCase();

  if (n.startsWith("c1")) {
    return {
      group: "C-Type",
      distribution: "Clustered",
      windows: "Narrow Windows",
      category: "Type-1",
      description: "C-Type, Clustered, Narrow Windows, Type-1",
    };
  }

  if (n.startsWith("c2")) {
    return {
      group: "C-Type",
      distribution: "Clustered",
      windows: "Wide Windows",
      category: "Type-2",
      description: "C-Type, Clustered, Wide Windows, Type-2",
    };
  }

  if (n.startsWith("r1") && !n.startsWith("rc")) {
    return {
      group: "R-Type",
      distribution: "Random",
      windows: "Narrow Windows",
      category: "Type-1",
      description: "R-Type, Random, Narrow Windows, Type-1",
    };
  }

  if (n.startsWith("r2") && !n.startsWith("rc")) {
    return {
      group: "R-Type",
      distribution: "Random",
      windows: "Wide Windows",
      category: "Type-2",
      description: "R-Type, Random, Wide Windows, Type-2",
    };
  }

  if (n.startsWith("rc1")) {
    return {
      group: "RC-Type",
      distribution: "Mixed",
      windows: "Narrow Windows",
      category: "Type-1",
      description: "RC-Type, Mixed, Narrow Windows, Type-1",
    };
  }

  if (n.startsWith("rc2")) {
    return {
      group: "RC-Type",
      distribution: "Mixed",
      windows: "Wide Windows",
      category: "Type-2",
      description: "RC-Type, Mixed, Wide Windows, Type-2",
    };
  }

  return null;
}

export function getInstanceDescription(name: string): string {
  return getInstanceMeta(name)?.description ?? "";
}
