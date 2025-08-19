import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    static register: (req: Request, res: Response, next: NextFunction) => void;
    static login: (req: Request, res: Response, next: NextFunction) => void;
    static logout: (req: Request, res: Response, next: NextFunction) => void;
    static getCurrentUser: (req: Request, res: Response, next: NextFunction) => void;
    static changePassword: (req: Request, res: Response, next: NextFunction) => void;
    static resetPassword: (req: Request, res: Response, next: NextFunction) => void;
    static deactivateUser: (req: Request, res: Response, next: NextFunction) => void;
    static activateUser: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=authController.d.ts.map