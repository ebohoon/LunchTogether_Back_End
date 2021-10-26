const { lunchs, sequelize, users } = require("../models");
const { logger } = require("../config/logger"); //로그

getlunchlist = async (req, res) => {
  try {
    const lunch = await lunchs.findAll({
      order: [["date", "DESC"]],
    });
    logger.info("GET /lunchpost/");
    return res.status(200).send({
      result: "success",
      msg: "리스트 불러오기 성공",
      lunch: lunch,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).send({
      result: "fail",
      msg: "리스트 불러오기 실패",
    });
  }
};

detaillunchpost = async (req, res) => {
  const { lunchid } = req.params;
  try {
    const lunchDetail = await lunchs.findOne({
      include: [{ model: users, attributes: ["nickName"] }],
      where: { lunchid: lunchid },
    });
    const data = { lunch: lunchDetail };
    logger.info("GET /lunchpost/:lunchId");
    return res.status(200).send({
      result: "success",
      msg: "점심약속 상세정보 성공",
      data: data,
    });
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(400).send({
      result: "fail",
      msg: "점심약속 상세정보 실패",
    });
  }
};

postlunchlist = async (req, res) => {
  const user = res.locals.user;
  const { title, content, date, location, time, membernum } = req.body;

  try {
    const querys =
      "insert into lunchs (userId ,title,content , date, location,time, membernum) value (:userId,:title,:content,:date,:location,:time,:membernum);";
    const lunch = await sequelize.query(querys, {
      replacements: {
        userId: user.userId,
        title: title,
        content: content,
        date: date,
        location: location,
        time: time,
        membernum: membernum,
      },
      type: sequelize.QueryTypes.INSERT,
    });
    const data = { lunch :lunch}
    logger.info("POST /lunchPost");
    return res.status(200).send({
      result: "success",
      msg: "게시글 작성 성공",
      data : data,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).send({
      result: "fail",
      msg: "게시글 작성 실패",
    });
  }
};

updatelunchlist = async (req, res) => {
  const { lunchid } = req.params;
  const { title, content, date, location, time, membernum } = req.body;
  // const ispost = JSON.parse(post);

  try {
    let querys = "UPDATE lunchs SET";
    if (title) querys = querys + " title = :title,";
    if (content) querys = querys + " content = :content,";
    if (date) querys = querys + " date = :date,";
    if (location) querys = querys + " location = :location,";
    if (time) querys = querys + " time = :time,";
    if (membernum) querys = querys + " membernum = :membernum,";

    querys = querys.slice(0, -1);

    querys = querys + " WHERE lunchid = :lunchid;";
    const lunch = await sequelize.query(querys, {
      replacements: {
        lunchid: lunchid,
        title: title,
        content: content,
        date: date,
        location: location,
        time: time,
        membernum: membernum,
      },
      type: sequelize.QueryTypes.UPDATE,
    });
    const data = {lunch : lunch}
    logger.info("PATCH/lunchPost");
    return res.status(200).send({
      result: "success",
      msg: "약속 수정 성공",
      data : data,
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).send({
      result: "fail",
      msg: "약속 수정 실패",
    });
  }
};

module.exports = {
  getlunchlist: getlunchlist,
  detaillunchpost: detaillunchpost,
  postlunchlist: postlunchlist,
  updatelunchlist: updatelunchlist,
};
