export interface PackItem {
  id: string;
  name: string;
  w: number;
  h: number;
  qty: number;
}

export interface PlacedItem {
  name: string;
  w: number;
  h: number;
  count: number;
}

export interface Row {
  height: number;
  items: PlacedItem[];
  freeWidth: number;
}

export interface RowGroup {
  row: Row;
  count: number;
}

export interface NestingResult {
  groups: RowGroup[];
  totalLength: number;
  baseLength: number;
  margin: number;
  totalCost: number;
  smartNestingNotes: string[];
  itemAnalysis: string[];
}

export function calculateNesting(
  items: PackItem[],
  costPerMeter: number,
  rollWidth: number = 565,
  gap: number = 2
): NestingResult {
  // Clone items and sort by area descending
  let pending = items
    .map((i) => ({ ...i, area: i.w * i.h }))
    .sort((a, b) => b.area - a.area);
  
  const originalItems = [...pending];
  const rows: Row[] = [];
  const smartNestingNotes: Set<string> = new Set();

  while (pending.length > 0) {
    const mainItem = pending[0];

    // Find best orientation for the main item
    const o1Count = Math.floor((rollWidth + gap) / (mainItem.w + gap));
    const o2Count = Math.floor((rollWidth + gap) / (mainItem.h + gap));

    const o1Eff = (o1Count * mainItem.w * mainItem.h) / (rollWidth * mainItem.h);
    const o2Eff = (o2Count * mainItem.w * mainItem.h) / (rollWidth * mainItem.w);

    let useW = mainItem.w;
    let useH = mainItem.h;
    let maxCount = o1Count;

    if (o2Eff > o1Eff) {
      useW = mainItem.h;
      useH = mainItem.w;
      maxCount = o2Count;
    }

    const countToPlace = Math.min(maxCount, mainItem.qty);

    const row: Row = {
      height: useH,
      items: [{ name: mainItem.name, w: useW, h: useH, count: countToPlace }],
      freeWidth: rollWidth - (countToPlace * useW + Math.max(0, countToPlace - 1) * gap),
    };

    mainItem.qty -= countToPlace;
    if (mainItem.qty === 0) {
      pending.shift();
    }

    // Try to fill freeWidth with other items (Gap Filling)
    for (let i = 0; i < pending.length; i++) {
      const fillItem = pending[i];
      if (fillItem.qty <= 0) continue;

      let bestFillW = 0;
      let bestFillH = 0;
      let bestFillCount = 0;

      // Try orientation 1
      if (fillItem.h <= row.height) {
        const c1 = Math.floor(row.freeWidth / (fillItem.w + gap));
        if (c1 > bestFillCount) {
          bestFillCount = c1;
          bestFillW = fillItem.w;
          bestFillH = fillItem.h;
        }
      }

      // Try orientation 2
      if (fillItem.w <= row.height) {
        const c2 = Math.floor(row.freeWidth / (fillItem.h + gap));
        if (c2 > bestFillCount) {
          bestFillCount = c2;
          bestFillW = fillItem.h;
          bestFillH = fillItem.w;
        }
      }

      if (bestFillCount > 0) {
        const placeCount = Math.min(bestFillCount, fillItem.qty);
        row.items.push({
          name: fillItem.name,
          w: bestFillW,
          h: bestFillH,
          count: placeCount,
        });
        row.freeWidth -= placeCount * bestFillW + placeCount * gap;
        fillItem.qty -= placeCount;

        smartNestingNotes.add(
          `Nas filas de ${mainItem.name}, aproveitei o espaço lateral para encaixar ${fillItem.name}.`
        );

        if (fillItem.qty === 0) {
          pending.splice(i, 1);
          i--; // Adjust index after removal
        }
      }
    }

    rows.push(row);
    pending = pending.filter((p) => p.qty > 0);
  }

  // Group identical rows
  const groups: RowGroup[] = [];
  for (const row of rows) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && areRowsIdentical(lastGroup.row, row)) {
      lastGroup.count++;
    } else {
      groups.push({ row, count: 1 });
    }
  }

  const baseLengthMm =
    groups.reduce((acc, g) => acc + (g.row.height + gap) * g.count, 0) -
    (groups.length > 0 ? gap : 0);
  const baseLengthM = baseLengthMm / 1000;
  const marginM = 0.15; // 15cm
  const totalLengthM = baseLengthM + marginM;
  const totalCost = totalLengthM * costPerMeter;

  const itemAnalysis = originalItems.map((item) => {
    const count = Math.floor((rollWidth + gap) / (item.w + gap));
    const countRotated = Math.floor((rollWidth + gap) / (item.h + gap));
    let bestCount = count;
    let usedW = item.w;
    if (countRotated > count) {
      bestCount = countRotated;
      usedW = item.h;
    }
    const free = rollWidth - (bestCount * usedW + Math.max(0, bestCount - 1) * gap);
    return `Item (${item.name}): ${item.w}x${item.h}mm. Cabem ${bestCount} unidades por fila. Sobram ${free}mm de largura livre.`;
  });

  return {
    groups,
    baseLength: baseLengthM,
    margin: marginM,
    totalLength: totalLengthM,
    totalCost,
    smartNestingNotes: Array.from(smartNestingNotes),
    itemAnalysis,
  };
}

function areRowsIdentical(r1: Row, r2: Row) {
  if (r1.height !== r2.height) return false;
  if (r1.items.length !== r2.items.length) return false;
  for (let i = 0; i < r1.items.length; i++) {
    if (
      r1.items[i].name !== r2.items[i].name ||
      r1.items[i].count !== r2.items[i].count
    )
      return false;
  }
  return true;
}
