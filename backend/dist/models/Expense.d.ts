import { Model, Optional } from 'sequelize';
export interface ExpenseAttributes {
    expense_id: number;
    amount: number;
    category: 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'marketing' | 'other';
    description: string;
    expense_date?: Date;
    vendor?: string;
    receipt_number?: string;
    payment_method?: string;
    approved_by?: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    created_at?: Date;
    updated_at?: Date;
}
export interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, 'expense_id' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
    expense_id: number;
    amount: number;
    category: 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'marketing' | 'other';
    description: string;
    expense_date?: Date;
    vendor?: string;
    receipt_number?: string;
    payment_method?: string;
    approved_by?: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Expense;
//# sourceMappingURL=Expense.d.ts.map