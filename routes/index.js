// set up dependencies
var express = require('express');
const request = require("request");
const config = require("./../config.json");
var router = express.Router();
let deviceStatus = []
let roomStatus = {}
let channelList = []
let tunerList = []
let inputList = []
let eventItems = []
let jobItems = {}
let jobItemsParsed = []
let jobCompleted = []

let timerDeviceStatus = null;
async function updateDeviceStatus() {
  clearTimeout(timerDeviceStatus);
  timerDeviceStatus = null;
  // Devices
  await new Promise((resolve) => {
    request.get({
      url: `http://${(config.backend) ? config.backend : 'localhost:9080'}/status/devices`,
      timeout: 60000
    }, async function (err, resReq, body) {
      if (err) {
        console.error(err);
        resolve(false)
      } else {
        try {
          //console.log("Updated Status")
          deviceStatus = JSON.parse(body)
          tunerList = deviceStatus.tuners.filter(e => e.history)
          inputList = deviceStatus.inputs
          resolve(true)
        } catch (err) {
          console.error(err)
          resolve(false)
        }
      }
    })
  })
  // Rooms
  await new Promise((resolve) => {
    request.get({
      url: `http://${(config.backend) ? config.backend : 'localhost:9080'}/status/rooms`,
      timeout: 60000
    }, async function (err, resReq, body) {
      if (err) {
        resolve(false)
      } else {
        try {
          //console.log("Updated Status")
          roomStatus = JSON.parse(body)
          resolve(true)
        } catch (err) {
          console.error(err)
          resolve(false)
        }
      }
    })
  })
  timerDeviceStatus = setTimeout( updateDeviceStatus, 30000)
}
updateDeviceStatus();

let updateTimer = null
async function getDeviceStatus() {
  clearTimeout(updateTimer);
  let timeoutTime = 30000
  // Events
  await new Promise((resolve) => {
    request.get({
      url: `http://${(config.backend) ? config.backend : 'localhost:9080'}/status/events`,
      timeout: 60000
    }, async function (err, resReq, body) {
      if (err) {
        console.error(err);
        console.error(body)
        timeoutTime = 5000
        resolve([])
      } else {
        try {
          eventItems = JSON.parse(body)
          //console.log("Updated Events")
          resolve(true)
        } catch (err) {
          console.error(err)
          timeoutTime = 5000
          resolve([])
        }
      }
    })
  })
  // Jobs
  await new Promise((resolve) => {
    request.get({
      url: `http://${(config.backend) ? config.backend : 'localhost:9080'}/status/jobs`,
      timeout: 60000
    }, async function (err, resReq, body) {
      if (err) {
        console.error(err);
        console.error(body)
        timeoutTime = 5000
        resolve([])
      } else {
        try {
          //console.log("Updated Jobs")
          jobItems = JSON.parse(body)
          let parsedGUIDs = []
          jobItemsParsed = [
            ...jobItems.activeJob.map(e => {
              const event = (e.guid) ? eventItems.filter(f => f.event.guid === e.guid) : []
              parsedGUIDs.push(e.guid)
              return {
                ...e,
                event: (event && event.length > 0) ? event[0] : undefined,
                status: 2
              }
            }),
            ...jobItems.pendingJobs.filter(e => !e.guid || parsedGUIDs.indexOf(e.guid) === -1).map(e => {
              const event = (e.guid) ? eventItems.filter(f => f.event.guid === e.guid) : []
              parsedGUIDs.push(e.guid)
              return {
                ...e,
                event: (event && event.length > 0) ? event[0] : undefined,
                status: 1
              }
            }),
            ...jobItems.requestedJobs.filter(e => (!e.guid || parsedGUIDs.indexOf(e.guid) === -1) && e.done === false).map(e => {
              const event = (e.guid) ? eventItems.filter(f => f.event.guid === e.guid) : []
              parsedGUIDs.push(e.guid)
              return {
                ...e,
                event: (event && event.length > 0) ? event[0] : undefined,
                status: 0
              }
            })
          ]

          jobCompleted = [
            ...jobItems.completed,
            ...jobItems.tunedEvents.filter(e => jobItems.completed.indexOf(e) === -1)
          ];
          resolve([])
        } catch (err) {
          console.error(err)
          timeoutTime = 5000
          resolve([])
        }
      }
    })
  })
  // Channels
  await new Promise((resolve) => {
    request.get({
      url: `http://${(config.backend) ? config.backend : 'localhost:9080'}/status/channels`,
      timeout: 60000
    }, async function (err, resReq, body) {
      if (err) {
        console.error(err);
        console.error(body)
        timeoutTime = 5000
        resolve([])
      } else {
        try {
          //console.log("Updated Channels")
          channelList = JSON.parse(body)
          resolve([])
        } catch (err) {
          console.error(err)
          timeoutTime = 5000
          resolve([])
        }
      }
    })
  })
  updateTimer = setTimeout(getDeviceStatus, timeoutTime)
}
getDeviceStatus()


function simpleAuth(req, res, next) {
  if (config.key) {
    if (!req.query.key)
      res.status(401).send("No Auth Provided")
    if (req.query.key && req.query.key !== config.key)
      res.status(401).send("Invalid Auth Provided")
  }
  next();
}

// setup routing
router.get(['/', '/devices'], simpleAuth, function(req, res, next) {
  if (req.header("Seq-BaseURL")) {
    res.render('dashboard-seqapp', {
      baseUrl: req.header("Seq-BaseURL"),
      channels: config.favorite_channels.map(e => channelList.filter(f => f.number === e)[0]),
      recording_url: config.recording_url
    })
  } else {
    res.render('dashboard', {})
  }
})

router.get('/deviceStatus', simpleAuth, async (req, res) => {
  if (tunerList.length > 0 || inputList.length > 0) {
    res.status(200).render('dashboard-tuners' + (req.header("Seq-BaseURL") ? '-seqapp' : ''), {
      tuners: deviceStatus,
      inputs: inputList,
      msToTime: function (s) {
        // Pad to 2 or 3 digits, default is 2
        function pad(n, z) {
          z = z || 2;
          return ('00' + n).slice(-z);
        }

        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        return [pad(hrs), pad(mins), pad(secs)];
      },
      eventList: eventItems.slice(0).filter(e => !e.event.isEpisode && !e.event.exists && jobCompleted.indexOf(e.event.guid) === -1 && !e.event.queued && (e.event.syncStart >= (Date.now() - 14400000)) && ((e.event.duration && e.event.duration > 15 * 60) || (!e.event.duration && (Date.now() - e.event.syncStart)) > 15 * 60000)),
      liveList: eventItems.slice(0).filter(e => !e.event.duration),
      jobList: jobItemsParsed,
    })
  } else {
    res.status(500).send("Backend Failure")
  }
});
router.get('/channelsList', simpleAuth, async (req, res) => {
  if (channelList.length > 0) {
    res.status(200).render('model-channels', {
      channels: channelList,
      tuner: req.query.tuner,
      digital: (req.query.digital && req.query.digital === "true"),
    })
  } else {
    res.status(500).send("Backend Failure")
  }
});
router.get('/zoneList', simpleAuth, async (req, res) => {
  if (roomStatus) {
    res.status(200).render('model-zones', {
      zones: Object.values(roomStatus)
    })
  } else {
    res.status(500).send("Backend Failure")
  }
});
router.get('/eventList', simpleAuth, async (req, res) => {
  if (eventItems.length > 0) {
    let limit = 45
    let start = 0
    let page = 1
    let items = eventItems.slice(0)
    switch (req.query.type || "0") {
      case '1': // Live
        items = items.filter(e => !e.event.duration)
        break;
      case '2': // Songs
        items = items.filter(e => ((e.event.duration && e.event.duration < 15 * 60) || (!e.event.duration && (Date.now() - e.event.syncStart) < 15 * 60000)))
        break;
      case '3': // Events
        items = items.filter(e => ((e.event.duration && e.event.duration > 15 * 60) || (!e.event.duration && (Date.now() - e.event.syncStart)) > 15 * 60000))
        break;
      default:
        break;
    }
    if (req.query.filter) {
      switch (req.query.filter.split('-')[0]) {
        case 'ch': // Live
          items = items.filter(e => e.channel === req.query.filter.slice(3))
          break;
        case 'tuner': // Songs
          items = items.filter(e => !e.event.noTuner && e.tuner && e.tuner.id === req.query.filter.slice(6))
          break;
        default:
          break;
      }
    }



    if (req.query.limit) {
      limit = parseInt(req.query.limit) || 30
    }
    if (req.query.page) {
      page = parseInt(req.query.page) || 1
      start = ((page - 1) * limit + 1) || 0
    }

    if (!req.query.reverse)
      items = items.reverse()
    const pageCount = (limit < items.length) ? (parseInt((items.length / limit).toFixed(0)) + 1) : 1
    res.status(200).render('table-playlist' + (req.header("Seq-BaseURL") ? '-seqapp' : ''), {
      eventList: items.slice(start, start + limit),
      channels: channelList,
      tuners: tunerList,
      page, pageCount,
      type: req.query.type || "0",
      filter: req.query.filter || "all"
    })
  } else {
    res.status(200).render('table-playlist' + (req.header("Seq-BaseURL") ? '-seqapp' : ''), {
      channels: channelList,
      tuners: tunerList,
      inputs: inputList,
      page: 1, pageCount: 1,
      type: req.query.type || "0",
      filter: req.query.filter || "all"
    })
  }
});
router.get('/jobList', simpleAuth, async (req, res) => {
  if (eventItems.length > 0) {
    let items = jobItemsParsed.slice(0)

    let limit = 45
    let start = 0
    let page = 1

    if (req.query.limit) {
      limit = parseInt(req.query.limit) || 30
    }
    if (req.query.page) {
      page = parseInt(req.query.page) || 1
      start = ((page - 1) * limit + 1) || 0
    }



    if (req.query.reverse)
      items = items.reverse()
    const pageCount = (limit < items.length) ? (parseInt((items.length / limit).toFixed(0)) + 1) : 1
    res.status(200).render('table-jobs' + (req.header("Seq-BaseURL") ? '-seqapp' : ''), {
      jobList: items.slice(start, start + limit),
      page, pageCount,
      type: req.query.type || "0",
      filter: req.query.filter || "all"
    })
  } else {
    res.status(200).render('table-jobs' + (req.header("Seq-BaseURL") ? '-seqapp' : ''), {
      page: 1, pageCount: 1,
      type: req.query.type || "0",
      filter: req.query.filter || "all"
    })
  }
});

router.get('/api/*', simpleAuth, async (req, res) => {
  request.get({
    url: `http://${(config.backend) ? config.backend : 'localhost:9080'}${req.originalUrl.substring(4)}`,
    timeout: 30000
  }, async function (err, resReq, body) {
    if (err) {
      console.error(err);
      res.status(500).send("Backend API Failure")
    } else {
      console.log(body)
      res.status(resReq.statusCode).send(body)
    }
  })
});
router.get('/updateFileName', simpleAuth, async (req, res) => {
  if (req.query.ch && req.query.ch.length > 0 &&
      req.query.guid && req.query.guid.length > 0 &&
      req.query.filename && req.query.filename.length > 0) {
    const response = await new Promise((resolve) => {
      request.get({
        url: `http://${(config.backend) ? config.backend : 'localhost:9080'}/metadata/update?ch=${req.query.ch}&guid=${req.query.guid}&filename=${encodeURIComponent(decodeURIComponent(req.query.filename))}`,
        timeout: 30000
      }, async function (err, resReq, body) {
        if (err) {
          console.error(err);
          resolve(false)
        } else {
          resolve(body)
        }
      })
    })
    if (response) {
      res.status(200).send(response)
    } else {
      res.status(500).send("Backend Failure")
    }
  } else {
    res.status(400).send('Missing Required Data')
  }
});

// export the module
module.exports = router;
