const axios = require('axios')
const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const schedule = require('node-schedule')
const config = require("./config")

const ApartIdObj = {
    "10": "8170",
    "11": "8003",
    "12": "8003",
    "13": "8006",
    "14": "8006",
    "15": "8007",
    "16": "8008",
    "17": "8009",
    "18": "8163",
    "19": "8010",
    "20": "8011",
    "21": "8012",
    "22": "8013",
    "23": "8014",
    "24": "8015",
    "28": "8016",
    "29": "8157",
    "34": "8018",
    "40": "8019",
    "43": "8020",
    "45": "8021",
    "46": "8022",
    "47": "8023",
    "48": "8024",
    "49": "8304"
}

const usedPower = () => {
    const url = 'http://www.gyruibo2.cn/WxSearch/GetRoomInfo'
    const params = {
        SchID: '1',
        Apartid: ApartIdObj[config.Build],
        Roomname: config.Room
    }
    axios.get(url, {
        params
    }).then((res) => {
        if (res.status !== 200) {
            return false
        }
        const resData = res.data
        const doc = new dom().parseFromString(resData)
        const roomName = (xpath.select('//div/div/div/label/text()', doc))[0].nodeValue.trim()
        const UsedElect = (xpath.select('//div/div/div/label/text()', doc))[1].nodeValue.trim().replace(/度/, '').trim()
        const Remaining = (xpath.select('//div/div/div/label/text()', doc))[2].nodeValue.trim().replace(/度/, '').trim()
        const TimeStamp = (xpath.select('//div/div/div/label/text()', doc))[3].nodeValue.trim()

        if (!config.isPush){
            const printObj = {
                status: res.status,
                roomName,
                UsedElect,
                Remaining,
                TimeStamp
            }
        }
        if (config.isPush && Number(Remaining) <= config.Power) {
            Prompt(Number(Remaining))
        }
    }).catch((err) => {
        console.log(err)
    })
}

const Prompt = (electric) => {
    const tokenArr = config.Token
    const title = encodeURI(`电量预警：${electric}度`)
    const content = encodeURI(`<br><br><div>剩余电量：<span style="color: red">${electric}</span>度</div><br><br>`)
    for (let i = 0; i < tokenArr.length; i++) {
        const url = `http://wx.xtuis.cn/${tokenArr[i]}.send?text=${title}&desp=${content}`
        axios.get(url)
            .then(() => {
            }).catch(() => {
        })
    }

}

const morningSchedule = () => {
    //每天早上8点触发
    schedule.scheduleJob('0 0 10 * * *', () => {
        usedPower();
    })
}

const eveningSchedule = () => {
    //每天晚上8点触发
    schedule.scheduleJob('0 0 20 * * *', () => {
        usedPower();
    })
}

morningSchedule();
eveningSchedule();
