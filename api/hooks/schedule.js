const schedule = require('node-schedule');
const Project = require('../states/projects');

const job = schedule.scheduleJob('1 43 5 * *', async function () {
  const lists = await Project.find({});
  lists.forEach((element) => {
    // 需要的几次打卡
    const needCount = parseInt(
      (new Date(element.endAt).getTime() - new Date(element.startAt).getTime()) / (1000 * 60 * 60 * 24),
      10
    );

    // 尚未结束
    if (element.status === 0) {
      // 已经结束
      // 算一下满足的和不满足的
      const completUser = [];
      const uncompletUser = [];
      if (new Date(element.endAt).getTime() <= new Date().getTime()) {
        element.participant.forEach((e) => {
          if (e.records.length >= needCount) {
            completUser.push(e.did);
          } else {
            uncompletUser.push(e.did);
          }
        });
        // 算出每个人该退的钱
        // const money = Math.floor((element.participant.length * element.unitPrice) / completUser.length);

        // completUser.forEach((e) => {
        //   // todo: 给每个用户转账
        // });

        Project.update(
          {
            _id: element._id,
          },
          { status: 1 }
        );
      }
    }
  });
});

module.exports = job;
