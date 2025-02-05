const { addArticle, getArticles, getASingleArticle, deleteArticle, articleReaction, getArticleByTag, getAllTags, articleStats, viewArticle } = require("../controllers/articleController");
const router = require("express").Router();


router.get("/", getArticles);
router.get("/tags", getAllTags);
router.get("/statistics", articleStats);
router.get("/view/:id", viewArticle);
router.get("/:id", getASingleArticle);
router.get("/tag/:tag", getArticleByTag);
router.post("/", addArticle);
router.delete("/:id", deleteArticle);
router.patch("/:id/react", articleReaction);

module.exports = router;
