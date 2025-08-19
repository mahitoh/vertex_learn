interface LoginCredentials {
    email: string;
    password: string;
}
interface RegisterData {
    email: string;
    password: string;
    role: "admin" | "student" | "staff";
    first_name?: string;
    last_name?: string;
    phone?: string;
}
interface AuthResponse {
    user: {
        user_id: number;
        email: string;
        role: string;
        first_name?: string;
        last_name?: string;
    };
    token: string;
}
export declare class AuthService {
    private static readonly SALT_ROUNDS;
    private static readonly JWT_SECRET;
    private static readonly JWT_EXPIRES_IN;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static generateToken(payload: {
        user_id: number;
        email: string;
        role: string;
    }): string;
    static verifyToken(token: string): any;
    static register(userData: RegisterData): Promise<AuthResponse>;
    static login(credentials: LoginCredentials): Promise<AuthResponse>;
    static changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    static resetPassword(userId: number, newPassword: string): Promise<void>;
    static deactivateUser(userId: number): Promise<void>;
    static activateUser(userId: number): Promise<void>;
}
export {};
//# sourceMappingURL=authService.d.ts.map