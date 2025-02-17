const Sequelize = require("sequelize")

module.exports = function (sequelize) {
    return sequelize.define('Ponuda', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tekst: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        cijenaPonude: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        datumPonude: {
            type: Sequelize.STRING,
            allowNull: false
        },
        odbijenaPonuda: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'Ponude',
        timestamps: false
    });
}