import { Component, signal } from '@angular/core';
import { SampleFormComponent } from './sample-form/sample-form';

@Component({
  selector: 'app-root',
  imports: [SampleFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('material-test2');
}
