const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Invoice = require('./Invoice');

User.hasMany(Invoice, {
    foreignKey: 'user_id',
    onDelete: 'SET NULL'
});

Invoice.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'SET NULL'
});

Category.hasMany(Product, {
    foreignKey: 'category_id',
    onDelete: 'SET NULL'
});

Product.belongsTo(Category, {
    foreignKey: 'category_id',
    onDelete: 'SET NULL'
});

// Product.belongsTo(Invoice, {
//     foreignKey: 'invoice_id',
//     onDelete: 'SET NULL'
// });

Invoice.hasMany(Product, {
    foreignKey: 'invoice_id',
    onDelete: 'SET NULL'
});

module.exports = {
    User,
    Product,
    Category,
    Invoice
}