const { Product } = require('../models/product')
const express = require('express')
const { Category } = require('../models/category')
const { Subcategory } = require('../models/subcategory')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    },
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {
    // localhost:3000/api/v1/products?categories=2342342,234234
    let filter = {}
    if (req.query.categories) {
        //t get the query string
        filter = { category: req.query.categories.split(',') }
    }

    const productList = await Product.find().populate('category')
    //const productList = await Product.find().select('name image').populate('category');
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})





router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product)
})

router.post(`/search`, async (req, res) => {
    // localhost:3000/api/v1/products?categories=2342342,234234
    
   
    let filter = {}
    if (req.body.color) {
        var colorlist = req.body.color
        //t get the query string req.body.description
        filter["productdetails.color"] = req.body.color;
       
    }

    if (req.body.richDescription) {
     
        //t get the query string req.body.description
        filter["richDescription"] = { $regex: req.body.richDescription, $options: "i" };
       
    }
    if (req.body.name) {
     
        //t get the query string req.body.description
        filter["name"] = { $regex: req.body.name, $options: "i" };
       
    }
    if (req.body.description) {
     
        //t get the query string req.body.description
        filter["description"] = { $regex: req.body.description, $options: "i" };
       
    }

    if (req.body.priceRange) {
        var pricelist = req.body.priceRange
        var price = pricelist.split(',')
        //t get the query string req.body.description
        filter["price"] = {
            $gte: price[0], 
            $lt: price[1]
        } 
    }
    if (req.body.rating) {
       
        //t get the query string req.body.description
        filter["rating"] = req.body.rating
        
    }
    if (req.body.brand) {
       
        //t get the query string req.body.description
        filter["brand"] = req.body.brand
        
    }
    if (req.body.size) {
       
        //t get the query string req.body.description
        // filter["size"] = req.body.size
        filter["productdetails.sizeandqty.sizename"] = req.body.size;
    }
    if (req.body.occassion) {
       
        //t get the query string req.body.description
        filter["occassion"] = req.body.occassion
    }

    if (req.body.isPromotion) {
       
        //t get the query string req.body.description
        filter["isPromotion"] = req.body.isPromotion
    }
    if (req.body.isFeatured) {
       
        //t get the query string req.body.description
        filter["isFeatured"] = req.body.isFeatured
    }
    if (req.body.subcategory) {
       
        //t get the query string req.body.description
        filter["subcategory"] = req.body.subcategory
    }

    if (req.body.categoryFor) {
       
        //t get the query string req.body.description
      
        
        let subcategoryaList =[];
        const subcategoryList =  await Subcategory.find({ categoryFor: req.body.categoryFor }).select('_id');
        subcategoryList.map(function(k){
            subcategoryaList.push(k._id)
              
        })
        filter["subcategory"] = {$in: subcategoryaList}
 

    }
    
   
   
    const productList = await Product.find(filter).populate('category').populate('subcategory');
    //const productList = await Product.find().select('name image').populate('category');
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})




router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid Category')

    const subcategory = await Subcategory.findById(req.body.subcategory)
    if (!subcategory) return res.status(400).send('Invalid Subcategory')

    const file = req.file
    if (!file) return res.status(400).send('No image in the request')

    var colorlist = req.body.colors
    var colors = colorlist.split(',')


    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        subcategory: req.body.subcategory,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        size: req.body.size,
        occassion: req.body.occassion,
        isPromotion: req.body.isPromotion,
        colors:colors
    })

    product = await product.save()

    if (!product) return res.status(500).send('The product cannot be created')

    res.send(product)
})


router.post(`/UploadSingleImage/`, uploadOptions.single('image'), async (req, res) => {
    

    const file = req.file
    if (!file) return res.status(400).send('No image in the request')



    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`


    res.send(`${basePath}${fileName}`)
})

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid Category')

    const subcategory = await Subcategory.findById(req.body.subcategory)
    if (!subcategory) return res.status(400).send('Invalid Subcategory')

    const product = await Product.findById(req.params.id)
    if (!product) return res.status(400).send('Invalid Product!')

    const file = req.file
    let imagepath

    
    var colorlist = req.body.colors
    var colors = colorlist.split(',')


    if (file) {
        const fileName = file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        imagepath = `${basePath}${fileName}`
    } else {
        // old image
        imagepath = product.image
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            subcategory: req.body.subcategory,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            size: req.body.size,
            occassion: req.body.occassion,
            isPromotion: req.body.isPromotion,
            colors:colors
        },
        { new: true }
    )

    if (!updatedProduct)
        return res.status(500).send('the product cannot be updated!')

    res.send(updatedProduct)
})

router.delete('/:id', (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res
            .status(404)
            .json({ success: false, message: 'product not found11!' })
    }
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res
                    .status(200)
                    .json({ success: true, message: 'the product is deleted!' })
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'product not found!' })
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err })
        })
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count)

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount,
    })
})

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count)

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products)
})

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
        }
        const files = req.files
        let imagesPaths = []
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`)
            })
        }
        var colorlist = req.body.colors
    var colors = colorlist.split(',')

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
                colors:colors
                
            },
            { new: true }
        )

        if (!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product)
    }
)


router.put(
    '/ProductDetails/:id',
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
        }
        
        mongoose.set('useNewUrlParser', true);
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        mongoose.set('useUnifiedTopology', true);

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                productdetails: req.body.productdetails
                
            },
            { new: true }
        )


        res.send(product)
    }
)

module.exports = router
