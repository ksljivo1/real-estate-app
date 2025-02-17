const Sequelize = require("sequelize")

module.exports = function (sequelize) {
    return sequelize.define('Korisnik', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ime: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        prezime: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        username: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        admin: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: 'Korisnici', // Explicitly defining the table name
        timestamps: false // Assuming no createdAt/updatedAt columns
    });
}