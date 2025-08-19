import { Model, Optional } from 'sequelize';
export interface GradeAttributes {
    grade_id: number;
    student_id: number;
    course_id: number;
    score: number;
    letter_grade?: string;
    grade_points?: number;
    assessment_type: 'exam' | 'quiz' | 'assignment' | 'project' | 'final';
    assessment_date?: Date;
    comments?: string;
    created_at?: Date;
    updated_at?: Date;
}
export interface GradeCreationAttributes extends Optional<GradeAttributes, 'grade_id' | 'created_at' | 'updated_at'> {
}
export declare class Grade extends Model<GradeAttributes, GradeCreationAttributes> implements GradeAttributes {
    grade_id: number;
    student_id: number;
    course_id: number;
    score: number;
    letter_grade?: string;
    grade_points?: number;
    assessment_type: 'exam' | 'quiz' | 'assignment' | 'project' | 'final';
    assessment_date?: Date;
    comments?: string;
    readonly created_at: Date;
    readonly updated_at: Date;
    calculateLetterGrade(): void;
}
export default Grade;
//# sourceMappingURL=Grade.d.ts.map