/** Target share of clocked time spent on aircraft work. */
export const UTILIZATION_TARGET = 0.8;

export interface UtilizationInput {
  userId: number;
  name: string;
  shiftHours: number;
  aircraftHours: number;
  internalHours: number;
}

export interface UtilizationRow extends UtilizationInput {
  /** Clocked in but not on any task. */
  unassignedHours: number;
  /** aircraftHours / shiftHours, or null with no shift time. */
  utilization: number | null;
  meetsTarget: boolean;
}

export function utilizationRows(inputs: UtilizationInput[]): UtilizationRow[] {
  return inputs
    .map((i) => {
      const utilization = i.shiftHours > 0 ? i.aircraftHours / i.shiftHours : null;
      return {
        ...i,
        unassignedHours: Math.max(0, Math.round((i.shiftHours - i.aircraftHours - i.internalHours) * 100) / 100),
        utilization,
        meetsTarget: utilization !== null && utilization >= UTILIZATION_TARGET,
      };
    })
    .sort((a, b) => (b.utilization ?? -1) - (a.utilization ?? -1));
}
