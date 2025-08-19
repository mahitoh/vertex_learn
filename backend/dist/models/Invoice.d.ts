import { Model, Optional } from 'sequelize';
export interface InvoiceAttributes {
    invoice_id: number;
    student_id: number;
    invoice_number: string;
    amount: number;
    invoice_type: 'tuition' | 'fees' | 'library' | 'laboratory' | 'other';
    description?: string;
    due_date?: Date;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    payment_date?: Date;
    payment_method?: string;
    transaction_id?: string;
    created_at?: Date;
    updated_at?: Date;
}
export interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, 'invoice_id' | 'invoice_number' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
    invoice_id: number;
    student_id: number;
    invoice_number: string;
    amount: number;
    invoice_type: 'tuition' | 'fees' | 'library' | 'laboratory' | 'other';
    description?: string;
    due_date?: Date;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    payment_date?: Date;
    payment_method?: string;
    transaction_id?: string;
    readonly created_at: Date;
    readonly updated_at: Date;
    static generateInvoiceNumber(): string;
}
export default Invoice;
//# sourceMappingURL=Invoice.d.ts.map