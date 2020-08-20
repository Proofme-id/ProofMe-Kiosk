import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { IAdmin } from "app/interface/admin.interface";
import { IAccessManagementUser } from "app/interface/access-management-user.interface";

@Component({
    selector: 'delete-access',
    templateUrl: './delete-access.dialog.html',
    styleUrls: ['./delete-access.dialog.scss']
})
export class DeleteAccessDialogComponent implements OnInit {
    accessManagementUser: IAccessManagementUser;

    constructor(
        private dialogRef: MatDialogRef<DeleteAccessDialogComponent>,
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