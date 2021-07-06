import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent implements OnInit {

  total!: string;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.afs.doc('_counters/posts').snapshotChanges().subscribe((r: any) => {
      this.total = r.payload.data().count;
    })
  }

}
