import { Model, Optional } from 'sequelize';
export interface StudentAttributes {
    student_id: number;
    user_id: number;
    student_number: string;
    program?: string;
    year_level?: number;
    enrollment_date?: Date;
    graduation_date?: Date;
    gpa?: number;
    status: 'active' | 'inactive' | 'graduated' | 'suspended';
    created_at?: Date;
    updated_at?: Date;
}
export interface StudentCreationAttributes extends Optional<StudentAttributes, 'student_id' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
    student_id: number;
    user_id: number;
    student_number: string;
    program?: string;
    year_level?: number;
    enrollment_date?: Date;
    graduation_date?: Date;
    gpa?: number;
    status: 'active' | 'inactive' | 'graduated' | 'suspended';
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Student;
//# sourceMappingURL=Student.d.ts.map