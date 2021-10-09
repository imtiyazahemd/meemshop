const {Subcategory} = require('../models/subcategory');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) =>{
    const subcategoryList = await Subcategory.find();

    if(!subcategoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(subcategoryList);
})

router.get('/:id', async(req,res)=>{
    const subcategory = await Subcategory.findById(req.params.id);

    if(!subcategory) {
        res.status(500).json({message: 'The subcategory with the given ID was not found.'})
    } 
    res.status(200).send(subcategory);
})

router.post(`/`, uploadOptions.single('image'),async (req, res) =>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let subcategory = new Subcategory({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
        category:req.body.category,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        categoryFor: req.body.categoryFor
    })

    subcategory = await subcategory.save();

    if(!subcategory) 
    return res.status(500).send('The subcategory cannot be created')

    res.send(subcategory);
})


router.put('/:id', uploadOptions.single('image'),async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.id)) {
       return res.status(400).send('Invalid Subcategory Id')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) return res.status(400).send('Invalid Subcategory!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        // old image
        imagepath = product.image;
    }


    const updatedSubcategory  = await Subcategory.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
            category:req.body.category,
            image: imagepath,
            categoryFor: req.body.categoryFor
        },
        { new: true}
    )

    if(!updatedSubcategory)
    return res.status(500).send('the Subcategory cannot be updated!')

    res.send(updatedSubcategory);
})

router.delete('/:id', (req, res)=>{
    Subcategory.findByIdAndRemove(req.params.id).then(subcategory =>{
        if(subcategory) {
            return res.status(200).json({success: true, message: 'the subcategory is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "subcategory not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;