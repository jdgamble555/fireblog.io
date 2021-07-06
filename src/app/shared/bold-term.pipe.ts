import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boldTerm'
})
export class BoldTermPipe implements PipeTransform {

  transform(value: any, args: any[]): any {
    let v = value;
    for (const trigram of args) {

      // split trigram into letters
      const c = trigram.split('');

      // create regex
      const reg = `(<\/?b>)*(${c[0]})(<\/?b>)*(${c[1]})(<\/?b>)*(${c[2]})(<\/?b>)*`;
      let re = new RegExp(reg, 'gi');

      // replace all previous bolds with just one bold
      v = v.replace(re, "<b>$2$4$6</b>");
    }
    const r = new RegExp(/<b>(\w+)<b>/, 'i');
    while (v.match(r)) {
      v = v.replace(r, "<b>$1");
    }
    //return `<pre>${v}</pre>`;

    const phrase: any = [];
    let add = false;
    for (const t of v.split(' ')) {
      if (add || t.includes('<b>')) {
        phrase.push(t);
        add = true;
      }
    }
    if (!add) {
      return v;
    }
    return phrase.join(' ');
  }
}
