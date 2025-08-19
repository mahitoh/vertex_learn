import { Model, Optional } from 'sequelize';
export interface LeaveAttributes {
    leave_id: number;
    employee_id: number;
    leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid';
    start_date: Date;
    end_date: Date;
    days_requested?: number;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_by?: number;
    approval_date?: Date;
    comments?: string;
    created_at?: Date;
    updated_at?: Date;
}
export interface LeaveCreationAttributes extends Optional<LeaveAttributes, 'leave_id' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Leave extends Model<LeaveAttributes, LeaveCreationAttributes> implements LeaveAttributes {
    leave_id: number;
    employee_id: number;
    leave_type: 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid';
    start_date: Date;
    end_date: Date;
    days_requested?: number;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_by?: number;
    approval_date?: Date;
    comments?: string;
    readonly created_at: Date;
    readonly updated_at: Date;
    calculateDays(): number;
}
export default Leave;
//# sourceMappingURL=Leave.d.ts.map