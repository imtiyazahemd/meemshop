const mongoose = require('mongoose');

const subcategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: { 
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    categoryFor: { 
        type: String,
    },
    image: {
        type: String,
        default: ''
    }
})

exports.Subcategory = mongoose.model('Subcategory', subcategorySchema);