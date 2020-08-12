import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { IAdmin } from "app/interface/admin.interface";

@Component({
    selector: 'delete-admin',
    templateUrl: './delete-admin.dialog.html',
    styleUrls: ['./delete-admin.dialog.scss']
})
export class DeleteAdminDialogComponent implements OnInit {
    admin: IAdmin;

    constructor(
        private dialogRef: MatDialogRef<DeleteAdminDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data
    ) {
        console.log('data:', data);
        this.admin = data;
    }

    ngOnInit() {

    }

    save() {
        this.dialogRef.close({accepted: true});
    }

    close() {
        this.dialogRef.close({accepted: false});
    }
}