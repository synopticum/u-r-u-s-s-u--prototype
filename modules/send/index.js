var Dot  = require('../../models').Dot,
    Ads  = require('../../models').Ads,
    News  = require('../../models').News,
    Anonymous  = require('../../models').Anonymous,
    Lead  = require('../../models').Lead,
    Claims  = require('../../models').Claims,
    Message  = require('../../models').Message;

var all = function (req, res) {
    var data = {};
    // -> find dots
    Dot.find(function (err, result) {
        if (err) utils.errorHandler(err, 'Dots Get Error');
        data.dots = result;

        // -> find Ads
        Ads.find(function (err, result) {
            if (err) utils.errorHandler(err, 'Ads Get Error');
            data.ads = result;

            // -> find News
            News.find(function (err, result) {
                if (err) utils.errorHandler(err, 'News Get Error');
                data.news = result;

                // -> find Anonymous
                Anonymous.find(function (err, result) {
                    if (err) utils.errorHandler(err, 'Anonymous Get Error');
                    data.anonymous = result;

                    // -> find Lead
                    Lead.find(function (err, result) {
                        if (err) utils.errorHandler(err, 'Lead Get Error');
                        data.lead = result;

                        // -> find Claims
                        Claims.find(function (err, result) {
                            if (err) utils.errorHandler(err, 'Claims Get Error');
                            data.claims = result;

                            // -> find Claims
                            Message.find(function (err, result) {
                                if (err) utils.errorHandler(err, 'Messages Get Error');
                                data.messages = result;
                                res.send(200, data);
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports.all = all;