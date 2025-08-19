import { Model, Optional } from 'sequelize';
export interface ExamAttributes {
    exam_id: number;
    course_id: number;
    title: string;
    description?: string;
    exam_date: Date;
    duration_minutes?: number;
    total_marks?: number;
    exam_type: 'midterm' | 'final' | 'quiz' | 'practical';
    location?: string;
    instructions?: string;
    is_published: boolean;
    created_at?: Date;
    updated_at?: Date;
}
export interface ExamCreationAttributes extends Optional<ExamAttributes, 'exam_id' | 'is_published' | 'created_at' | 'updated_at'> {
}
export declare class Exam extends Model<ExamAttributes, ExamCreationAttributes> implements ExamAttributes {
    exam_id: number;
    course_id: number;
    title: string;
    description?: string;
    exam_date: Date;
    duration_minutes?: number;
    total_marks?: number;
    exam_type: 'midterm' | 'final' | 'quiz' | 'practical';
    location?: string;
    instructions?: string;
    is_published: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Exam;
//# sourceMappingURL=Exam.d.ts.map