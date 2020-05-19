export class Descripcion {
  public cabina: number;
  public usuario: string;
  public grupo: string;
  public extension: string;
  public primary: string;
  public secondary: string;

  constructor() {
    this.cabina = Number();
    this.usuario = '';
    this.grupo = '';
    this.extension = '';
    this.primary = '';
    this.secondary = '';
  }

  loadClassFromString(cadena: string) {
    // console.log(cadena);
    if (null != cadena && cadena.length > 0 && cadena !== 'descripción') {
      const arr = cadena.split('\n');
      // console.log(arr[0]);
      // console.log(arr[1]);
      this.grupo = arr[0].split(':')[1].trim();
      this.usuario = arr[1].split(':')[1].trim();
      this.extension = arr[2].split(':')[1].trim();
      this.cabina = Number(arr[3].split(':')[1].trim());
      this.primary = arr[4] ? arr[4].split(':')[1].trim() : '#e3bc08';
      this.secondary = arr[5] ? arr[5].split(':')[1].trim() : '#FDF1BA';
    }
  }

  loadClassFromObject(evento: any) {
    this.grupo = evento.grupo;
    this.extension = evento.extension;
    this.cabina = evento.cabina;
    this.usuario = evento.usuario;
    this.primary = evento.primary;
    this.secondary = evento.secondary;
  }

  toStringCalendar(): string {
    return `${this.usuario} del grupo ${this.grupo}, tiene reservada la cabina ${this.cabina} de la extension ${this.extension}`;
  }

  toStringGoogleCalendar(): string {
    return `Grupo: ${this.grupo}
            Usuario: ${this.usuario}
            Ext: ${this.extension}
            Cabina: ${this.cabina}
            Color 1: ${this.primary}
            Color 2: ${this.secondary}
            cabin${this.cabina}`;
  }
}
