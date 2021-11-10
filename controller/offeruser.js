const {
  lunchs,
  sequelize,
  useroffer,
  users,
  lunchdata,
  applicant,
} = require("../models");
const { logger } = require("../config/logger"); //로그
require("date-utils");

postlunchlist = async (req, res) => {
  const user = res.locals.user;
  const { title, content, date, location, membernum, duration, userid } = req.body;
  const postDate = new Date();
  const time = postDate.toFormat("YYYY-MM-DD HH24:MI:SS");
  console.log(
    "타이틀" + title,
    "코맨트" + content,
    "날짜" + date,
    "위치" + location,
    "맴버수" + membernum,
    "몇시간" + duration,
    "누구랑" + userid
  );
  if(userid === user.userid){
    logger.error("POST /offer 나는 나에게 점약신청을 한다!");
    return res.status(400).send({
      result: "fail",
      msg: "본인에게 점약은 신청불가능 합니다.",
    });
  }
  try {
    //쿼리문 해석 .. lunchdata에 해당 객체를 넣는데 lunchdata DB안에 해당객체의 id값이 존재하는 경우 넣지 않는다.
    const query =
      "insert into lunchdata (id,address_name,road_address_name,category_group_name,place_name,place_url,phone,x,y) select :id,:address_name,:road_address_name,:category_group_name,:place_name,:place_url,:phone,:x,:y From dual WHERE NOT exists(select * from lunchdata where id = :id);";
    const locationdb = await sequelize.query(query, {
      replacements: {
        id: location.id,
        address_name: location.address_name,
        road_address_name: location.road_address_name,
        category_group_name: location.category_group_name,
        place_name: location.place_name,
        place_url: location.place_url,
        phone: location.phone,
        x: location.x,
        y: location.y,
        id: location.id,
      },
      type: sequelize.QueryTypes.INSERT,
    });
    const lunch = await lunchs.create({
      userid: user.userid,
      title: title,
      content: content,
      date: date,
      location: location.id,
      time: time,
      membernum: membernum,
      duration: duration,
      confirmed: false,
      private: true,
    });
    const offerusers = await useroffer.create({
      userid: userid,
      lunchid: lunch.dataValues.lunchid,
    });
    const data = {
      lunch: lunch,
      offerusers: offerusers,
    };
    logger.info("POST /offer");
    return res.status(200).send({
      result: "success",
      msg: "점약 약속" + userid + "에게 신청 성공",
      data: data,
    });
  } catch (err) {
    logger.error(err);
    console.log(err);
    return res.status(400).send({
      result: "fail",
      msg: "약속 신청 실패",
    });
  }
};

module.exports = {
    postlunchlist:postlunchlist,
  };
  