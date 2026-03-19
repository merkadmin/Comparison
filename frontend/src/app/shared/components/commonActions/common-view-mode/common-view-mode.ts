import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ViewMode = 'list' | 'cards';

@Component({
  selector: 'app-common-view-mode',
  standalone: true,
  imports: [],
  templateUrl: './common-view-mode.html',
  styleUrl: './common-view-mode.less',
})
export class CommonViewModeComponent {
  @Input() viewMode: ViewMode = 'list';
  @Output() viewModeChange = new EventEmitter<ViewMode>();
}
