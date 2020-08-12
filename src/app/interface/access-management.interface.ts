import { IAccessManagementUser } from "./access-management-user.interface";

export interface IAccessManagement {
    ACCESS_LIST: IAccessManagementUser[];
    ENABLE_FACE_RECOGNITION: boolean;
    IDENTIFY_BY: string[];
}