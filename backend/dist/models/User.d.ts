import { Model, Optional } from 'sequelize';
export interface UserAttributes {
    user_id: number;
    email: string;
    password_hash: string;
    role: 'admin' | 'student' | 'staff';
    first_name?: string;
    last_name?: string;
    phone?: string;
    is_active: boolean;
    last_login?: Date;
    created_at?: Date;
    updated_at?: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'user_id' | 'is_active' | 'created_at' | 'updated_at'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    user_id: number;
    email: string;
    password_hash: string;
    role: 'admin' | 'student' | 'staff';
    first_name?: string;
    last_name?: string;
    phone?: string;
    is_active: boolean;
    last_login?: Date;
    readonly created_at: Date;
    readonly updated_at: Date;
    get full_name(): string;
}
export default User;
//# sourceMappingURL=User.d.ts.map