import { Model, Optional } from 'sequelize';
export interface PayrollAttributes {
    payroll_id: number;
    employee_id: number;
    pay_period_start: Date;
    pay_period_end: Date;
    gross_pay: number;
    deductions: number;
    net_pay: number;
    overtime_hours: number;
    overtime_pay: number;
    bonus: number;
    tax_deduction: number;
    insurance_deduction: number;
    status: 'draft' | 'processed' | 'paid';
    pay_date?: Date;
    created_at?: Date;
    updated_at?: Date;
}
export interface PayrollCreationAttributes extends Optional<PayrollAttributes, 'payroll_id' | 'deductions' | 'net_pay' | 'overtime_hours' | 'overtime_pay' | 'bonus' | 'tax_deduction' | 'insurance_deduction' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Payroll extends Model<PayrollAttributes, PayrollCreationAttributes> implements PayrollAttributes {
    payroll_id: number;
    employee_id: number;
    pay_period_start: Date;
    pay_period_end: Date;
    gross_pay: number;
    deductions: number;
    net_pay: number;
    overtime_hours: number;
    overtime_pay: number;
    bonus: number;
    tax_deduction: number;
    insurance_deduction: number;
    status: 'draft' | 'processed' | 'paid';
    pay_date?: Date;
    readonly created_at: Date;
    readonly updated_at: Date;
    calculateNetPay(): void;
}
export default Payroll;
//# sourceMappingURL=Payroll.d.ts.map