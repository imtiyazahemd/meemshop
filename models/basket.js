const mongoose = require('mongoose');

const basketSchema = mongoose.Schema({
    basketItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }
})

basketSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

basketSchema.set('toJSON', {
    virtuals: true,
});

exports.Basket = mongoose.model('Basket', basketSchema);
