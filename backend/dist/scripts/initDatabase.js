"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = exports.initializeDatabase = void 0;
const database_1 = require("../config/database");
require("../models");
const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing database...');
        await database_1.sequelize.authenticate();
        console.log('✅ Database connection established.');
        await database_1.sequelize.sync({ force: false, alter: true });
        console.log('✅ Database tables synchronized.');
        console.log('🎉 Database initialization completed successfully!');
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
const resetDatabase = async () => {
    try {
        console.log('🔄 Resetting database...');
        await database_1.sequelize.sync({ force: true });
        console.log('✅ Database reset completed.');
        console.log('🎉 Database reset completed successfully!');
    }
    catch (error) {
        console.error('❌ Database reset failed:', error);
        throw error;
    }
};
exports.resetDatabase = resetDatabase;
if (require.main === module) {
    const command = process.argv[2];
    if (command === 'reset') {
        (0, exports.resetDatabase)()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    }
    else {
        (0, exports.initializeDatabase)()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    }
}
//# sourceMappingURL=initDatabase.js.map