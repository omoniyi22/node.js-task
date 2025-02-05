const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true, },
    text: { type: String, required: true },
    picture: { type: String, required: true },
    views: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    tags: Array,
},
    {
        timestamps: true,
    }
);

articleSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model("Articles", articleSchema);

