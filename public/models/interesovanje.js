const Sequelize = require("sequelize")

module.exports = function (sequelize) {
    return sequelize.define('Interesovanje', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        interesovanje_fk: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        tip_interesovanja: {
            type: Sequelize.STRING(255),
            allowNull: false,
            isIn: {
                args: [
                    ['upit', 'zahtjev', 'ponuda']
                ],
                msg: "Treba biti upit, zahtjev ili ponuda"
            }

        }
    }, {
        tableName: 'Interesovanja', // Explicitly defining the table name
        timestamps: false // Assuming no createdAt/updatedAt columns
    })
}