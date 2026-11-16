import type { TodaySummary } from '@/domain/entities/TodaySummary';
import { withThousands } from '@/shared/presentation/format/withThousands';
import { TEXT } from './constants';

/** Un dato del resumen: el valor con su unidad, y la etiqueta con una parte destacada. */
export type SummaryTile = {
  key: string;
  value: string;
  unit?: string;
  label: string;
  labelStrong?: string;
};
export type SummaryLot = {
  key: string;
  name: string;
  heads: string;
  share: number;
  empty: boolean;
};

export type TodaySummaryView = {
  /** El campo, su actividad y dónde queda: "La Tranquera · Cría · Castelli". */
  place: string;
  noted: { text: string; anything: boolean };
  tiles: SummaryTile[];
  lots: SummaryLot[];
  /** "7 lotes activos": los que tienen hacienda. */
  activeLots: string;
};

// Con un espacio que no se parte: el número y la unidad van siempre en el mismo renglón.
function millimeters(value: number): string {
  return `${withThousands(value)} ${TEXT.millimeters}`;
}

function daysAgoText(daysAgo: number): string {
  const named: Record<number, string> = { 0: TEXT.today, 1: TEXT.yesterday };
  return named[daysAgo] ?? `hace ${daysAgo} días`;
}

function lastRainTile(lastRain: TodaySummary['lastRain']): SummaryTile {
  if (lastRain === null) {
    return { key: 'lastRain', value: TEXT.noRain, label: TEXT.lastRain };
  }
  return {
    key: 'lastRain',
    value: daysAgoText(lastRain.daysAgo),
    label: `${TEXT.lastRain} · `,
    labelStrong: millimeters(lastRain.millimeters),
  };
}

function notedText({ rainMillimeters, movedAnimals }: TodaySummary['notedToday']): string {
  const parts = [
    rainMillimeters > 0 ? `${millimeters(rainMillimeters)} de lluvia` : null,
    movedAnimals === 1 ? '1 animal movido' : null,
    movedAnimals > 1 ? `${withThousands(movedAnimals)} animales movidos` : null,
  ].filter((part) => part !== null);
  return parts.length === 0 ? TEXT.nothingNoted : `${TEXT.notedPrefix} ${parts.join(' y ')}`;
}

function activeLotsText(lots: TodaySummary['lots']): string {
  const active = lots.filter((lot) => lot.total > 0).length;
  return active === 1 ? '1 lote activo' : `${active} lotes activos`;
}

function summaryTiles(summary: TodaySummary): SummaryTile[] {
  return [
    { key: 'heads', value: withThousands(summary.totalHeads), label: TEXT.heads },
    {
      key: 'monthRain',
      value: withThousands(summary.monthRain),
      unit: TEXT.millimeters,
      label: TEXT.monthRain,
    },
    lastRainTile(summary.lastRain),
  ];
}

function summaryLots(lots: TodaySummary['lots']): SummaryLot[] {
  const most = Math.max(0, ...lots.map((lot) => lot.total));
  return lots.map((lot) => ({
    key: String(lot.number),
    name: `${TEXT.lotPrefix}${lot.number}`,
    heads: withThousands(lot.total),
    share: most === 0 ? 0 : lot.total / most,
    empty: lot.total === 0,
  }));
}

/** Arma los textos del resumen de hoy a partir de los números del caso de uso. */
export function todaySummaryView(summary: TodaySummary): TodaySummaryView {
  const { notedToday } = summary;
  return {
    place: `${summary.farmName} · ${summary.activity} · ${summary.location}`,
    noted: {
      text: notedText(notedToday),
      anything: notedToday.rainMillimeters > 0 || notedToday.movedAnimals > 0,
    },
    tiles: summaryTiles(summary),
    lots: summaryLots(summary.lots),
    activeLots: activeLotsText(summary.lots),
  };
}
