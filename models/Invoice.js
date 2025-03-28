const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Invoice extends Model {}

Invoice.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            }
        },
        // must be an array of products
        products_ids: {
            type: DataTypes.UUID,
            allowNull: false,
            get() {
                return this.getDataValue('products_ids').split(';')
            },
            set(val) {
               this.setDataValue('products_ids', val.join(';'));
            },
        }
    },
    {
        sequelize,
        timestamps: true,
        freezeTableName: true,
        underscored: true,
        modelName: 'invoice'
    }
);

module.exports = Invoice;