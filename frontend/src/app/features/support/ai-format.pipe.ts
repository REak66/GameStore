import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'aiFormat', standalone: true, pure: true })
export class AiFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(text: string): SafeHtml {
    if (!text) return '';
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const formatted = escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // [[Game Name]] → clickable product search link
      .replace(/\[\[(.+?)\]\]/g, (_, name) => {
        const encoded = encodeURIComponent(name);
        return `<a href="/products?search=${encoded}" class="ai-game-link"><i class="fas fa-gamepad"></i>${name} <i class="fas fa-arrow-right ai-arrow"></i></a>`;
      })
      .replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
}
