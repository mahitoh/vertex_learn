import { Model, Optional } from 'sequelize';
export interface EmployeeAttributes {
    employee_id: number;
    user_id: number;
    employee_number: string;
    department: string;
    position: string;
    hire_date?: Date;
    salary?: number;
    employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
    manager_id?: number;
    status: 'active' | 'inactive' | 'terminated' | 'on_leave';
    emergency_contact?: string;
    created_at?: Date;
    updated_at?: Date;
}
export interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'employee_id' | 'employment_type' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
    employee_id: number;
    user_id: number;
    employee_number: string;
    department: string;
    position: string;
    hire_date?: Date;
    salary?: number;
    employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
    manager_id?: number;
    status: 'active' | 'inactive' | 'terminated' | 'on_leave';
    emergency_contact?: string;
    readonly created_at: Date;
    readonly updated_at: Date;
    get years_of_service(): number;
}
export default Employee;
//# sourceMappingURL=Employee.d.ts.map