const Sequelize = require("sequelize")

module.exports = function (sequelize) {
    return sequelize.define('Zahtjev', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tekst: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        trazeniDatum: {
            type: Sequelize.STRING,
            allowNull: false
        },
        odobren: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'Zahtjevi',
        timestamps: false
    });
}