const express = require("express");
const router = express.Router();
const axios = require("axios");
const crtl = require("../controller/cryptoController");
const urlLive = "http://10.210.210.16:5023/collects";

router.get("/", async (req, res) => {
  try {
    res.render("index");
  } catch (error) {
    res.send({
      message:
        error.message || "some error occured when trying to load this page!!!",
    });
  }
});
router.get("/crypto", async (req, res) => {
  try {
    const response = await crtl.getters.getCrypto();
    console.log(response);
    console.log("data informations:", response);
    const data = [];
    response.map((el) => {
      data.push({ id: el.id, user: el.name, balances: eval(el.balances) });
    });
    console.log(data);
    res.json(data);
  } catch (error) {
    res.send({
      message:
        error.message || "an error occured while trying to retrieve data",
    });
  }
});

// router.get("/", async (req, res) => {
//   try {
//     let metricsOptions = [];
//     const { data } = await axios.get(`${urlLive}/metrics`);

//     data.metrics.map((metricItem) => {
//       metricsOptions.push({
//         text: metricItem,
//         value: metricItem,
//       });
//     });

//     res.render("index", { dataMetrics: data.metrics, metricsOptions });
//   } catch (error) {
//     res.send({ status: 500, message: error.message });
//   }
// });

// router.post("/metrics", async (req, res) => {
//   try {
//     const metrics_name = req.body.name;
//     await axios.post(`${urlLive}/addMetrics`, { name: metrics_name });
//     res.status(200).json({ message: "metrics bien ajouté" });
//   } catch (error) {
//     res.send({ message: error.message });
//   }
// });

// router.get("/device/:arrayDevice/:metricsName", async (req, res) => {
//   var device = req.params.arrayDevice.split(",");
//   var metrics = req.params.metricsName;

//   try {
//     var result = { metrics_name: metrics, arrayDevice: device };
//     const response = await axios.post(
//       `${urlLive}/findCollectInMetricsAndDevice`,
//       result
//     );
//     res.status(200).json({ data: response.data.collects });
//   } catch (error) {
//     res.send({ message: error.message });
//   }
// });

// router.post("/setTag", async (req, res) => {
//   const response = [];
//   const { multipleDataRowsSelected, singleDataRowsSelected } = req.body;
//   const data = multipleDataRowsSelected || [singleDataRowsSelected];
//   data.map((el) => {
//     response.push({ _id: el._id, tag: el.tag });
//   });

//   try {
//     response.map(async (el) => {
//       await axios.post(`${urlLive}/setTagCollects`, {
//         arrayTag: el.tag,
//         arrayCollectId: [el._id],
//       });
//     });
//     res.status(200).json("acomplished");
//   } catch (error) {
//     res.send(error);
//   }
// });

// router.get("/getCollectsByMetricsName/:metrics", async (req, res) => {
//   const { metrics } = req.params;

//   try {
//     const { data } = await axios.get(`${urlLive}/metrics/${metrics}`);

//     res.status(200).json(data.collects);
//   } catch (error) {
//     res.send(error);
//   }
// });

module.exports = { indexRouter: router };
