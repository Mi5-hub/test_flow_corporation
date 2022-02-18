
jQuery(function () {
	// VARIABLE DECLARATION 
	var arrayTag = [] // tags posted
	var collectsDatatable = null
	var searchTrigger = ''
	var columnFormat = [{
		data: null,
		title: '',
		className: 'column-color'

	}]


	// SELECTIZE METRICS INITIALIZATION AND ON CHANGE
	$("#metrics").selectize({
		options: metricsOptions,
		onChange: function (nameMetrics) {
			columnFormat = [{
				data: null,
				title: '',
				className: 'column-color'
			}]
			loadMetrics(nameMetrics)
		}
	});

	// LOAD DATA METRICS AND APPEND DATATABLE HEADER 
	function loadMetrics(nameMetrics) {
		$.ajax({
			url: `getCollectsByMetricsName/${nameMetrics}`,
			type: 'GET',
			datatype: 'JSON',
			success: function (dataCollects) {

				var arrayTitle = Object.keys(dataCollects[0])
				var titleColumn = _.without(arrayTitle, '_id', 'metrics_name')

				destroyDatatable(collectsDatatable) // DESTROY OLD DATATABLE
				Table(dataCollects, titleColumn); // CREATE  NEW DATATABLE
				selectTriggerThead(titleColumn) // FUNCTION SELECT TRIGGER THEAD FOR EACH ROWS
				insertInputThead(searchTrigger) //  FUNCTION INSERT INPUT THEAD
				searchInput(collectsDatatable)  // SEARCH INPUT THEAD
				$('.btn-tag').prop('disabled', true) // REINITIALIZE BUTTON TAGS DISABLED
				selectMultiple(collectsDatatable) // SELECT MULTIPLE ROWS
				selectAll(collectsDatatable) // SELECT ALL ROWS

			}
		})
	}

	// MODAL SET AND ADD TAGS -------------------------------
	$('.add_tags').off('click').on('click', function () {
		var arrayTags = []
		var IdAndTagNoIntersection = [];
		var arrayCollectAndTag = []
		var dataRowsSelected = collectsDatatable.rows('.selected').data();
		if (dataRowsSelected.length > 1) {
			findTagsIntersection(dataRowsSelected, arrayCollectAndTag, IdAndTagNoIntersection, arrayTags) // FIND INTERSECTION TAGS BETWEEN SOME ROWS SELECTED
		} else {
			dataRowsSelected.map((el) => {
				arrayTags.push(el.tag)
			})
		}

		$.confirm({
			title: 'TAGS!',
			type: 'dark',
			content:
				`<div class= "col-sm-12 col-md-12 col-lg-12 form-group alfred_graph input_ select-list">
                <label for= "graph_"> SET TAGS : </label >
                <select class="form-control selectized" id="set_tag" multiple></select>
                </div>`,
			columnClass: 'col-md-12 confirm_tags',
			buttons: {
				formSubmit: {
					text: 'Submit',
					btnClass: 'btn-dark',
					action: function () {
						if (!dataRowsSelected.length) {
							alertNoArrayIdCollect()
							return false;
						} else if (dataRowsSelected.length > 1) {
							formatDataTags(IdAndTagNoIntersection, arrayTag, dataRowsSelected)  // FORMAT DATA TAGS BEFORE BEING POSTED
							// setTags(IdAndTagNoIntersection, multipleDataRowsSelected, dataRowsSelected, arrayTag)   // POST TAGS FUNCTION 

						} else if (dataRowsSelected.length === 1) {
							setTagsSingle(dataRowsSelected, arrayTag) // POST TAGS WITH SINGLE DATA ROWS SELECTED

						}

						collectsDatatable.rows().deselect()
					}
				},
				cancel: function () {
					//close
				},
			},
			onContentReady: function () {
				$("#set_tag").selectize({

					plugins: ["restore_on_backspace", "remove_button"],
					onChange: function (value) {
						arrayTag = _.uniq(value);
					},
					delimiter: " ",
					persist: false,
					create: function (input) {
						return {
							value: input,
							text: input,
						};
					},

				})
				getAllTags(arrayTags, dataRowsSelected) // GET ALL DATA TAGS AND INSERT TAGS SELECTED INTO SELECTIZE #SET_TAGS

			}
		});
	})
	// MODAL ADD METTRICS--------------------------------
	$('.add_metrics').off('click').on('click', function () {

		$.confirm({
			title: 'METRICS!',
			type: 'dark',
			content: `<form action="" class="formName">
                <div class="form-group">
                <label>Enter your metrics name here</label>
                <input type="text" placeholder="Metrics Name" class="name form-control" required />
                </div>
                </form>`,
			buttons: {
				formSubmit: {
					text: 'Submit',
					btnClass: 'btn-dark',
					action: function () {
						var metrics_name = this.$content.find('.name').val();
						if (!metrics_name) {
							$.alert({
								title: "",
								content: '<label class="text-confirm">Please enter your metrics name!!!</label>',
								type: 'red'
							});
							return false;
						} else {
							postMetricsName(metrics_name) // POST METRICS NAME
						}
					}
				},
				cancel: function () {
					//close
				},
			},
			onContentReady: function () {



				// bind to events
				var jc = this;
				this.$content.find('form').on('submit', function (e) {
					// if the user submits the form by pressing enter in the field.
					e.preventDefault();
					jc.$$formSubmit.trigger('click'); // reference the button and click it
				});

			}
		});
	})

	// DATATABLE ---------------------------
	function Table(dataCollects, titleColumn) {
		var tagIndex = _.indexOf(titleColumn, "tag")

		_.map(titleColumn, function (o) {
			columnFormat.push({
				data: `${o}`,
				title: `${o}`,
				className: 'column-color'
			})
		})
		collectsDatatable = $('#collectTable').DataTable({

			data: dataCollects,
			responsive: true,
			"scrollY": "500px",
			"scrollX": true,
			"scrollCollapse": true,
			"bJQueryUI": true,
			stateSave: true,
			'createdRow': function (row, data, dataIndex) {

				$(row).attr('id', data._id);

			},
			'columnDefs': [{
				'targets': '_all',
				className: "",
			}, {
				'targets': 0,
				"render": function (data, type, row) {
					return `<input type="checkbox" class="dt-checkbox" name="${data._id}">`;
				},
				'createdCell': function (td, cellData, rowData, row, col) {
					$(td).attr('class', 'first-row')
				},
			}, {
				'targets': ++tagIndex,

				'render': function (data, type, full, meta) {

					var Tags = '';
					for (var i = 0; i < _.uniq(data).length; i++) {
						Tags += `<label class='badge'>${_.uniq(data)[i]}</label>`
					}

					return Tags
				}
			},

			],


			responsive: true,
			columns: columnFormat,

		});

		// INSERT INPUT CHECK ALL
		$('.dataTables_scrollHeadInner > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(1)').html(`
        <input type="checkbox" id='check_all'> 
        `)


	}
	// DESTROY DATATABLE
	function destroyDatatable(collectsDatatable) {
		if (collectsDatatable != null) {
			collectsDatatable.destroy()
			$('#collectTable').empty()
		}
	}
	// FUNCTION SELECT TRIGGER THEAD
	function selectTriggerThead(titleColumn) {
		var i = 2
		var titleLength = ((titleColumn).length + 2)
		while (i <= titleLength) {
			searchTrigger += `.dataTables_scrollHeadInner > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(${i}),`
			if (i === (titleColumn.length + 1)) {
				searchTrigger += `.dataTables_scrollHeadInner > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(${i})`
				break;
			}
			i += 1
		}
	}
	//  FUNCTION INSERT INPUT THEAD
	function insertInputThead(searchTrigger) {
		$(`${searchTrigger}`).each(function () {
			$(this).addClass('head-color')
			var titleId = $(this).text()
			var title = _.capitalize(_.camelCase($(this).text()));
			$(this).html('<label>' + `<input id=${titleId} class= " input-sm search-input " type="text" placeholder=" ` + title + '" />' + '</label>');
		});
	}
	// SEARCH INPUT THEAD
	function searchInput(collectsDatatable) {
		collectsDatatable.columns().every(function () {
			var column = this;
			$('input', this.header()).on('keyup', function (e) {
				var searchInput = this;
				if (typeof (timeout) != 'undefined') clearTimeout(timeout);
				var timeout = setTimeout(function () {
					column.search(searchInput.value, true, false, true).draw();
					searchInput.focus();
				}, 300);
			});
			$('input', this.header()).on('click', function (e) {
				if (typeof (timeout) != 'undefined') clearTimeout(timeout);
				e.stopPropagation();
			});
		});
	}
	// FIND INTERSECTION TAGS BETWEEN SOME ROWS SELECTED
	function findTagsIntersection(dataRowsSelected, arrayCollectAndTag, IdAndTagNoIntersection, arrayTags) {
		var Tag = []
		var totalElementTag = []

		dataRowsSelected.map(el => {
			arrayCollectAndTag.push({ 'id': el._id, 'tag': el.tag })
			el.tag.map((i) => {
				Tag.push(i)
			})
		});

		countEachTagSelected(Tag, totalElementTag); // COUNT EACH TAGS ELEMENTS SELECTED
		totalElementTag.map((el) => {
			if (el.cnt === dataRowsSelected.length) {
				arrayTags.push(el.current)
			}
		})

		arrayCollectAndTag.map((el) => {
			IdAndTagNoIntersection.push({ 'id': el.id, 'tag': _.differenceBy(el.tag, arrayTags) })
		})
	}
	// FORMAT DATA TAGS (multiple) BEFORE BEING POSTED
	function formatDataTags(IdAndTagNoIntersection, arrayTag, dataRowsSelected) {
		var multipleDataRowsSelected = []
		var count = 0
		IdAndTagNoIntersection.map((el) => {
			multipleDataRowsSelected.push(_.find(dataRowsSelected, { '_id': el.id }))

			if (el.tag) {
				el['tag'] = arrayTag.concat(el.tag)
			} else {
				el['tag'] = arrayTag
			}
			multipleDataRowsSelected[count]['tag'] = el.tag
			++count

		})

		setTags(multipleDataRowsSelected) // SET MULTIPLE TAGS SELECTED FUNCTION 
	}
	// SET MULTIPLE TAGS SELECTED FUNCTION 
	function setTags(multipleDataRowsSelected) {

		$.ajax({
			url: `setTag/`,
			method: "POST",
			datatype: 'JSON',
			data: {
				multipleDataRowsSelected
			},

			success: function () {

				multipleDataRowsSelected.map((el) => {
					collectsDatatable
						.row('#' + el._id)
						.data(el)
						.draw()
				})


			}
		})
	}
	// SET SINGLE DATA ROWS SELECTED FUNCTION 
	function setTagsSingle(dataRowsSelected, arrayTag) {
		var singleDataRowsSelected = null
		dataRowsSelected.map((el) => {
			el.tag = arrayTag
			singleDataRowsSelected = el
		})
		$.ajax({
			url: `setTag/`,
			method: "POST",
			datatype: 'JSON',
			data: {
				singleDataRowsSelected
			},

			success: function (data) {
				dataRowsSelected.map((el) => {
					el.tag = arrayTag
					collectsDatatable
						.row('#' + el._id.trim())
						.data(el)
						.draw()
				})

			},

		})
	}
	// ALERT NO ARRAY ID COLLECTS
	function alertNoArrayIdCollect() {
		$.alert({
			title: "",
			content: '<label class="text-confirm">Please select at least one Collect to set Tag!!!</label>',
			type: 'red'
		});
	}
	// GET ALL DATA TAGS AND INSERT TAGS SELECTED INTO SELECTIZE #SET_TAGS
	function getAllTags(arrayTags, dataRowsSelected) {
		$.ajax({
			url: "http://10.210.210.16:5023/collects/tags",
			method: "GET",
			datatype: 'JSON',
			success: function (data) {
				const {
					tags
				} = data;

				tags.map((el) => {
					$('#set_tag')[0].selectize.addOption({

						text: el,
						value: el
					})
					if (dataRowsSelected.length === 1) {
						var defaultSelect = _.uniq(arrayTags[0])

					} else {
						var defaultSelect = _.uniq(arrayTags)

					}

					defaultSelect.map((el) => {
						$('#set_tag')[0].selectize.addItem(el);

					})



				})
			}
		})
	}

	// SELECT MULTIPLE ROWS
	function selectMultiple() {
		$('#collectTable tbody').on('click', 'tr', function () {
			var checkboxToSelect = $(this).attr('id')
			if ($(`input[name="${checkboxToSelect}"]`).hasClass('input-checked')) {
				$(`input[name="${checkboxToSelect}"]`).prop('checked', false)
			} else {
				$(`input[name="${checkboxToSelect}"]`).prop('checked', true)
			}
			$(`input[name="${checkboxToSelect}"]`).toggleClass('input-checked')
			$('#check_all').prop('checked', false)
			$(this).toggleClass('selected');
			if (collectsDatatable.rows('.selected').data().length) {
				$('.btn-tag').prop('disabled', false)
			}
			else {
				$('.btn-tag').prop('disabled', true)
			}
		});
	}
	
	// SELECT ALL ROWS TO GET DATA

	function selectAll() {
		var allPages = collectsDatatable.cells().nodes();

		$('#check_all').on('click', function () {
			if (this.checked) {
				$('.dt-checkbox').addClass('input-checked')
				collectsDatatable.rows().select()
				$(allPages).find('input[type="checkbox"]').prop('checked', true);
				$('.btn-tag').prop('disabled', false)
			} else {
				$('.dt-checkbox').removeClass('input-checked')
				collectsDatatable.rows().deselect()
				$(this).prop('checked', false)
				$(allPages).find('input[type="checkbox"]').prop('checked', false);
				$('.btn-tag').prop('disabled', true)

			}

		})
	}
	// COUNT EACH TAGS ELEMENTS SELECTED
	function countEachTagSelected(Tag, totalElementTag) {

		Tag.sort();
		var current = null;
		var cnt = 0;
		for (var i = 0; i < Tag.length; i++) {
			if (Tag[i] != current) {
				if (cnt > 0) {

					totalElementTag.push({ current, cnt })
				}
				current = Tag[i];
				cnt = 1;
			} else {
				cnt++;
			}
		}
		if (cnt > 0) {
			totalElementTag.push({ current, cnt })

		}

	}
	// AJAX POST METRICS NAME
	function postMetricsName(metrics_name) {
		$.ajax({
			url: '/metrics',
			method: 'POST',
			datatype: 'JSON',
			data: {
				name: metrics_name
			},
			success: function (data) {
			
			}
		})
	}
})

