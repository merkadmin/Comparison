import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (el) => {
    el.onmouseenter = Swal.stopTimer;
    el.onmouseleave = Swal.resumeTimer;
  },
});

@Injectable({ providedIn: 'root' })
export class ToastService {
  success(message: string): void {
    Toast.fire({ icon: 'success', title: message });
  }

  error(message: string): void {
    Toast.fire({ icon: 'error', title: message, timer: 4000 });
  }

  info(message: string): void {
    Toast.fire({ icon: 'info', title: message });
  }
}
