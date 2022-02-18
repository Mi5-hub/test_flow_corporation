jQuery(function () {
  // VARIABLE DECLARATION
  var euroValue = 0;
  function apiGetEuroValue() {
    try {
      $.ajax({
        url: `http://rest.coinapi.io/v1/assets/EUR?apikey=33BD6174-3C44-44F2-AAEA-288113741B5E`,
        method: "GET",
        datatype: "JSON",
        success: function (data) {
          euroValue = data[0].price_usd;
          getDataUser();
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  apiGetEuroValue();

  function getDataUser() {
    $.ajax({
      url: `/crypto`,
      method: "GET",
      datatype: "JSON",
      success: function (data) {
        // create table function
        Table(data);
      },
    });
  }
  // DATATABLE ---------------------------
  function Table(data) {
    collectsDatatable = $("#collectTable").DataTable({
      data: data,
      columns: [
        { data: "user", title: "user" },
        {
          data: "balances",
          title: "asset",
        },
		{data:'balances', title:'Total',render:function(data,type,full,meta){
			return `<label class='badge-total'>10.5710</label>`
		}}
      ],
      responsive: true,
      scrollY: "700px",
      scrollX: true,
      scrollCollapse: true,
      bJQueryUI: true,
      stateSave: true,
      createdRow: function (row, data, dataIndex) {
        $(row).attr("id", data._id);
      },
      columnDefs: [
        {
          targets: [0, 2],
          className: "first-row",
        },
        {
          targets: 1,

          render: function (data, type, full, meta) {
            var Badges = "";
			var sousTotal = null
			var arrayTotal = []
            for (var i = 0; i < _.uniq(data).length; i++) {
				 sousTotal += data[i].btcValue * parseFloat(data[i].free)
				console.log('sousTotal',sousTotal);
              Badges +=
                `<label class='badge'>${data[i].asset}:` +
                data[i].btcValue * parseFloat(data[i].free) +
                `</label>` +
                `<label class='badge-diff'>diff:` +
                (euroValue * parseFloat(data[i].free) - data[i].btcValue * parseFloat(data[i].free))+
                `</label>`;
            }
			console.log('=======================================================');
			arrayTotal.push(sousTotal)
			console.log('arrayTotalxxxxxxxxxxxxxxxxxxxxx',arrayTotal);
            return Badges;
          },
        },
		// {
		// 	targets: 3,
		// 	className:'first-row'
		// 	// render: function (data, type, full, meta) {
		// 	//   var Badges = "";
		// 	//   for (var i = 0; i < _.uniq(data).length; i++) {
		// 	// 	Badges +=
		// 	// 	  `<label class='badge-total'>${data[i].asset}:` +
		// 	// 	  data[i].btcValue * parseFloat(data[i].free) +
		// 	// 	  `</label>`;
		// 	//   }
  
		// 	//   return Badges;
		// 	// },
		//   },
      ],
    });
  }
});
