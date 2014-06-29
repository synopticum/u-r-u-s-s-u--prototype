// init
$.getJSON("/dots", function (data) {
    BDots = new BModel(data);
    View.map.init();
});