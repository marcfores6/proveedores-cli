import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noDisponible',
  standalone: true
})
export class NoDisponiblePipe implements PipeTransform {
  transform(value: any): string {
    if (value === null || value === undefined || value === '') {
      return 'No disponible';
    }
    return value;
  }
}
