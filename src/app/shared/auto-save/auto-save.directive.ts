import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

@Directive({
  selector: '[appAutoSave]'
})
export class AutoSaveDirective implements OnInit, OnDestroy {

  // Inputs
  @Input() formGroup!: FormGroup;
  @Input() getData!: Promise<any>;
  @Input() setData = async () => { };

  // Internal state
  private _state!: 'loading' | 'synced' | 'modified' | 'saving' | 'error' | 'loaded';

  // Outputs
  @Output() stateChange = new EventEmitter<string>();

  private formSub!: Subscription;

  constructor() { }

  ngOnInit(): void {
    this.preloadData();
    this.autoSave();
  }

  // Loads initial form data from db
  preloadData<T>(): void {
    this._state = 'loading';
    if (this.getData) {
      this.getData
        .then((data) => {
          if (data) {
            this.formGroup.patchValue(data);
            this.formGroup.markAsPristine();
            this.state = 'loaded';
          }
        });
    }
  }

  // Autosaves form changes
  autoSave(): void {
    this.formSub = this.formGroup.valueChanges
      .pipe(
        tap(() => {
          this.state = this.formGroup.invalid ? 'error' : 'modified';
        }),
        debounceTime(2000),
        tap(() => {
          this._setData();
        })
      )
      .subscribe();
  }

  // Writes changes
  private async _setData(): Promise<void> {
    if (this.formGroup.valid && this._state === 'modified') {
      this.state = 'saving';
      await this.setData();
      this.state = 'synced';
      this.formGroup.markAsPristine();
    }
  }

  // Intercept form submissions to perform the document write
  @HostListener('ngSubmit', ['$event'])
  onSubmit(): void {
    this._setData();
  }

  // Setter for state changes
  set state(val: any) {
    this._state = val;
    this.stateChange.emit(val);
  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
  }

}
