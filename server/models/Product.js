import mongoose from "mongoose";


const ImageSchema = new mongoose.Schema({
    url: String,
    publicId: String
}, {_id: false})

const ProductSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:"User", index: true, required: true},
    name: {type: String, required: true, trim: true, minlength: 2, maxlength: 80},
    sku: {type: String, trim: true},
    category: {type: String, trim: true},
    price: {type: Number, required: true, min: 0},
    cost: {type: Number, min: 0},
    quantity: {type: Number, required: true, min : 0},
    reorderLevel: {type: Number, default: 0, min: 0},
    image: {type : ImageSchema, default: null},
}, {timestamps: true})

ProductSchema.index({userId: 1, name: 1}, {unique: true});
ProductSchema.index({userId: 1, category: 1});

ProductSchema.index({name: 'text', category: "text"})

export default mongoose.model("Product", ProductSchema)