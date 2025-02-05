const Article = require("../models/article");
const { getIo } = require("../socket");



module.exports.getArticles = async (req, res, next) => {
  try {

    const { page, limit } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const totalItems = await Article.countDocuments();
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limitNumber) : totalItems
    const hasMore = pageNumber < totalPages;
    const articles = await Article.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      total_pages: totalPages,
      current_page: pageNumber,
      total_items: totalItems,
      has_more: hasMore,
      news: articles,
    })

  } catch (error) {
    next(error);
  }
};

module.exports.addArticle = async (req, res, next) => {
  try {
    const article = new Article(req.body);
    await article.save();
    if (article) return res.status(200).json(article);
    else return res.status(500).json({ msg: "Failed to add Article to the database" });
  } catch (error) {
    next(error);
  }
};

module.exports.getASingleArticle = async (req, res, next) => {
  try {
    let article = await Article.findById(req.params.id);
    await article.save()
    if (article) return res.status(200).json(article);
    else return res.status(500).json({ msg: "Failed to add Article to the database" });
  } catch (error) {
    next(error);
  }
};

module.exports.viewArticle = async (req, res, next) => {
  try {
    let article = await Article.findById(req.params.id);
    article.views += 1;
    await article.save()
    if (article) return res.status(200).json(article);
    else return res.status(500).json({ msg: "Failed to add Article to the database" });
  } catch (error) {
    next(error);
  }
};

module.exports.getArticleByTag = async (req, res, next) => {
  try {
    let tag = req.params.tag
    const articles = await Article.find({ tags: tag })
    if (articles) return res.status(200).json({ msg: "Article found successfully.", data: articles });
    else return res.status(500).json({ msg: "Failed to add Article to the database" });
  } catch (error) {
    next(error);
  }
};


module.exports.deleteArticle = async (req, res, next) => {
  try {
    let deleted = await Article.findByIdAndDelete(req.params.id);
    if (deleted) return res.status(200).json({ msg: "Article deleted successfully." });
    else return res.status(500).json({ msg: "Failed to add Article to the database" });
  } catch (error) {
    next(error);
  }
};

module.exports.articleReaction = async (req, res, next) => {
  const io = getIo();
  try {
    const article = await Article.findById(req.params.id);
    let { action, sign } = req.body
    let count = 0
    if (action && sign) {
      if (action === "like") {
        if (sign === "+")
          count = article.like += 1;
        else if (sign === "-")
          count = article.like === 0 ? article.like : article.like -= 1
      } else if (action === "dislike") {
        if (sign === "+")
          count = article.dislike += 1
        else if (sign === "-")
          count = article.dislike === 0 ? article.dislike : article.dislike -= 1;
      }
      article.save()
      io.emit("newReaction", { ...article._doc, id: article._doc._id });
      if (article) return res.status(200).json({ count });
    } else {
      res.status(400).json({ msg: "invald request" })
    }
  } catch (error) {
    next(error);
  }
};

module.exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await Article.distinct("tags");
    if (tags) res.json(tags);
    else {
      res.status(500).json({ msg: "Internal server error" })
    }
  } catch (error) {
    next(error)
  }
}

module.exports.articleStats = async (req, res, next) => {
  try {
    const totalNews = await Article.countDocuments();

    const avgViews = await Article.aggregate([
      { $group: { _id: null, avgViews: { $avg: "$views" } } },
    ]);
    const avgLikes = await Article.aggregate([
      { $group: { _id: null, avgLikes: { $avg: "$like" } } },
    ]);
    const avgDislikes = await Article.aggregate([
      { $group: { _id: null, avgDislikes: { $avg: "$dislike" } } },
    ]);

    const mostViewed = await Article.findOne().sort({ views: -1 });

    let response = {
      total_news: totalNews,
      avg_views: avgViews.length ? Math.round(avgViews[0].avgViews) : 0,
      avg_likes: avgLikes.length ? Math.round(avgLikes[0].avgLikes) : 0,
      avg_dislikes: avgDislikes.length ? Math.round(avgDislikes[0].avgDislikes) : 0,
      most_viewed: mostViewed
        ? { title: mostViewed.title, views: mostViewed.views, picture: mostViewed.picture }
        : null,
    };
    res.json(response)
  } catch (error) {
    next(error)
  }
}