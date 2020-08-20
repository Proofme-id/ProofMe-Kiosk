import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { IAdmin } from "app/interface/admin.interface";
import { IAccessManagementUser } from "app/interface/access-management-user.interface";

@Component({
    selector: 'edit-access',
    templateUrl: './edit-access.dialog.html',
    styleUrls: ['./edit-access.dialog.scss']
})
export class EditAccessDialogComponent implements OnInit {
    accessManagementUser: IAccessManagementUser;

    constructor(
        private dialogRef: MatDialogRef<EditAccessDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data
    ) {
        console.log('data:', data);
        this.accessManagementUser = data;
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