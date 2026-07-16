import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fechaCo', standalone: true })
export class FechaCoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}

@Pipe({ name: 'numeroCo', standalone: true })
export class NumeroCoPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals = 0): string {
    if (value == null || isNaN(value)) return '—';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}

@Pipe({ name: 'monedaCo', standalone: true })
export class MonedaCoPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return '—';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
