import { Model, Optional } from 'sequelize';
export interface AttendanceAttributes {
    attendance_id: number;
    student_id: number;
    course_id: number;
    date: Date;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
    marked_by?: number;
    created_at?: Date;
    updated_at?: Date;
}
export interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'attendance_id' | 'created_at' | 'updated_at'> {
}
export declare class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
    attendance_id: number;
    student_id: number;
    course_id: number;
    date: Date;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
    marked_by?: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Attendance;
//# sourceMappingURL=Attendance.d.ts.map