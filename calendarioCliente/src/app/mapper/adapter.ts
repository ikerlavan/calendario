import { Reserva } from '../entidades/reserva';

export interface Adapter<S> {
  map(item: Reserva): S;
}
