const express = require('express');
const {StoreKeyValue}  = require('../models/store');

const storeRouter = express.Router();

storeRouter.post('/', async (req,res) => {
    const {key, value} = req.body;

    if(!key || !value){
        return res.status(400).json({error: 'Both key and value required!'});
    }

    try{
        const existingKey = await StoreKeyValue.findOne({key});

        if(existingKey){
            return res.status(400).json({error : 'Key already exists.'});
        }

        const keyValue = new StoreKeyValue({key, value});
        await keyValue.save();

        return res.status(201).json({message: 'Key-Value pair stored successfully'});


    }catch(err){
        res.status(500).json({error: 'ınternal server error'});
    }
});

storeRouter.get('/:key', async(req,res) => {
    const { key } = req.params;

    try{
        const keyValue = await StoreKeyValue.findOne({key});

        if(!keyValue){
            return res.status(404).json({error : 'Key not found.'});
        }

        return res.status(200).json({key, value: keyValue.value})
    }catch(err){
        res.status(500).json({error: 'ınternal server error'});
    }
});

storeRouter.put('/:key', async (req,res) => {
    const { key } = req.params;
    const { value } = req.body;

    try{

         const keyValue = await StoreKeyValue.findOneAndUpdate({key}, {value}, {new: true});

         if(!keyValue){
            return res.status(404).json({error : 'Key not found.'});
        }

       return res.status(200).json({key, value: keyValue.value})

    }catch(err){
        res.status(500).json({error: 'ınternal server error'});
    }
});

storeRouter.delete('/:key', async (req,res) => {
    const { key } = req.params;

    try{
        const keyValue = await StoreKeyValue.findOneAndDelete({key})

        if(!keyValue){
            return res.status(404).json({error : 'Key not found.'});
        }

        return res.status(204).send();

    }catch(err){
        res.status(500).json({error: 'ınternal server error'});
    }
});

module.exports = {
    storeRouter
};