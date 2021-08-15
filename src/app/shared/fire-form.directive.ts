import { Directive, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { tap, take, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[libFireForm]'
})
export class FireFormDirective implements OnInit, OnDestroy {

  // Inputs
  @Input() path!: string;
  @Input() formGroup!: FormGroup;

  // Internal state
  private state$!: 'loading' | 'synced' | 'modified' | 'error';

  // Outputs
  @Output() stateChange = new EventEmitter<string>();
  @Output() formError = new EventEmitter<string>();

  // Update or New
  private isNewDoc = true;

  // Firestore Document
  private docRef!: AngularFirestoreDocument;

  // Subscriptions
  private formSub!: Subscription;

  constructor(private afs: AngularFirestore) { }


  ngOnInit(): void {
    this.preloadData();
    this.autoSave();
  }

  // Loads initial form data from Firestore
  preloadData(): void {
    this.state = 'loading';
    this.docRef = this.getDocRef(this.path);
    this.docRef
      .valueChanges()
      .pipe(
        tap((doc: any) => {
          if (doc) {
            this.formGroup.patchValue(doc);
            this.formGroup.markAsPristine();
            this.state = 'synced';
          }
        }),
        take(1)
      )
      .subscribe();
  }

  // Autosaves form changes
  autoSave(): void {
    this.formSub = this.formGroup.valueChanges
      .pipe(
        tap(() => {
          this.state = 'modified';
        }),
        debounceTime(2000),
        tap(() => {
          if (this.formGroup.valid && this.state$ === 'modified') {
            this.setDoc();
          }
        })
      )
      .subscribe();
  }

  // Intercept form submissions to perform the document write
  @HostListener('ngSubmit', ['$event'])
  onSubmit(e: any): void {
    this.setDoc();
  }


  // Determines if path is a collection or document
  getDocRef(path: string): any {
    if (path.split('/').length % 2) {
      this.isNewDoc = true;
      return this.afs.doc(`${path}/${this.afs.createId()}`);
    } else {
      this.isNewDoc = false;
      return this.afs.doc(path);
    }
  }

  // Writes changes to Firestore
  async setDoc(): Promise<void> {
    try {
      const data = this.formGroup.value;
      if (this.isNewDoc) {
        const createdAt = new Date();
        await this.docRef.set({createdAt, ...data}, { merge: true });
      }
      else {
        const updatedAt = new Date();
        await this.docRef.set({updatedAt, ...data}, { merge: true });
      }
      this.state = 'synced';
    } catch (err: any) {
      console.log(err);
      this.formError.emit(err.message);
      this.state = 'error';
    }
  }

  // Setter for state changes
  set state(val: any) {
    this.state$ = val;
    this.stateChange.emit(val);
  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
  }

}
