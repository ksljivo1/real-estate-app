const Sequelize = require("sequelize")

module.exports = function (sequelize) {
    return sequelize.define('Upit', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tekst: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'Upiti', // Explicitly define the table name
        timestamps: false // Assuming no createdAt/updatedAt columns
    });
}