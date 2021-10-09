const {Basket} = require('../models/basket');
const { OrderItem } = require('../models/order-item');
const express = require('express');
const router = express.Router();



router.get('/:userid', async(req,res)=>{
    const basket = await Basket.find({ user: req.params.userid }).populate('basketItems');
//
    if(!basket) {
        res.status(500).json({message: 'The basket with the given ID was not found.'})
    } 
    res.status(200).send(basket);
})

router.post('/', async (req,res)=>{

    const orderItemsIds = Promise.all(req.body.basketItems.map(
        async function(K){
           
                let newOrderItem = new OrderItem({
                quantity: K.quantity,
                product: K.product
                });
             
                newOrderItem = await newOrderItem.save();

                return newOrderItem;
        }


    ));
    const orderItemsIdsResolved =  await orderItemsIds;

    let basket = new Basket({
        basketItems: orderItemsIdsResolved,
        user: req.body.user
    });
    basket = await basket.save();

    if(!basket)
    return res.status(400).send('the basket cannot be created!')

    res.send(basket);
})

router.put('/:userid',async (req, res)=> {

   
    let basketid ='';
    const basketidlist =  await Basket.find({ user: req.params.userid }).select('_id');
    basketidlist.map(function(k){
        basketid =k._id
          
    })

 
    const basketItems =  await Basket.find({ _id: basketid }).select('basketItems');
    let basketItemslist =basketItems[0].basketItems;

    basketItemslist.map(
        async function(K1){
           
            OrderItem.findByIdAndRemove(K1)
            .then((orderitem) => {
                console.log('Removed',orderitem);
            })
            .catch((err) => {
                console.log( res.status(500).json({ success: false, error: err }));
            })
        }


    );

    const orderItemsIds = Promise.all(req.body.basketItems.map(
        async function(K){
           
                let newOrderItem = new OrderItem({
                quantity: K.quantity,
                product: K.product
                });
             
                newOrderItem = await newOrderItem.save();

                return newOrderItem;
        }


    ));
    const orderItemsIdsResolved =  await orderItemsIds;
  
    const basket = await Basket.findByIdAndUpdate(
        basketid,
        {
            basketItems: orderItemsIdsResolved,
            user: req.body.user
        },
        { new: true}
    )

    if(!basket)
    return res.status(400).send('the basket cannot be created!')

    res.send(basket);
})





module.exports =router;