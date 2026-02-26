import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('fr-FR').format(value);
  }
}