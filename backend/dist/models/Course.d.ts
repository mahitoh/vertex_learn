import { Model, Optional } from 'sequelize';
export interface CourseAttributes {
    course_id: number;
    name: string;
    code: string;
    description?: string;
    credits: number;
    instructor_id?: number;
    semester?: string;
    year?: number;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
export interface CourseCreationAttributes extends Optional<CourseAttributes, 'course_id' | 'is_active' | 'created_at' | 'updated_at'> {
}
export declare class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
    course_id: number;
    name: string;
    code: string;
    description?: string;
    credits: number;
    instructor_id?: number;
    semester?: string;
    year?: number;
    is_active: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Course;
//# sourceMappingURL=Course.d.ts.map