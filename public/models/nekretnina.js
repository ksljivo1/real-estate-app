const Sequelize = require("sequelize")

module.exports = function (sequelize) {
    return sequelize.define('Nekretnina', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tip_nekretnine: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        naziv: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        kvadratura: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        cijena: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        tip_grijanja: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        lokacija: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        godina_izgradnje: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        datum_objave: {
            type: Sequelize.STRING,
            allowNull: false
        },
        opis: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'Nekretnine', // Explicit table name
        timestamps: false // No createdAt/updatedAt columns
    });
}