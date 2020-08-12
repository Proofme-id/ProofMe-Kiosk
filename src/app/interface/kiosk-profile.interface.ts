import { IAdmin } from "./admin.interface";
import { IAccessManagement } from "./access-management.interface";

export interface IKioskProfile {
    ADMINS: IAdmin[];
    ACCESS_MANAGEMENT: IAccessManagement;
}