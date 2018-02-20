const datasets = ['user', 'adBlock', 'topUrl', 'author', 'contentSection', 'userAgent.platform', 'userAgent.operatingSystem', 'userAgent.browser', 'geoData.country', 'geoData.region', 'geoData.city', 'referrer', 'rawReferrer']
const composerDatasets = ['card', 'cardType', 'category', 'experience']
const checkoutDatasets = ['author', 'basePayment', 'contentSection', 'experienceActionId', 'experienceId', 'geoData.country', 'geoData.region', 'geoData.city', 'offerId', 'purchaseType', 'screenId', 'srcPayment', 'stepNumber', 'submitType', 'tags', 'termId', 'topUrl', 'user', 'userAgent.platform', 'userAgent.operatingSystem', 'userAgent.browser']

export const reformat = function (data) {
  let newData = {}

  datasets.forEach(function (dataset) {
    let fields = dataset.split('.')
    let values = []
    if (fields.length === 2) {
      values = data.value.data[fields[0]][fields[1]].values
    } else {
      values = data.value.data[dataset].values
    }
    let total = data.value.data.count
    let rank = 1
    newData[dataset] = values.map(function (element) {
      let obj = {}
      for (var p in element) {
        obj.id = p
        obj.count = element[p]
        obj.rel_percent = Math.round((element[p] / total) * 100)
      }
      obj.rank = rank++
      return obj
    })
  })
  return newData
}

export const reformatComposer = function (data) {
  console.log(data)
  var newData = {}
  composerDatasets.forEach(function (dataset) {
    var fields = dataset.split('.')
    var values = []
    if (fields.length === 2) {
      values = data.value.data[fields[0]][fields[1]].values
    } else {
      values = data.value.data[dataset].values
    }
    var rank = 1
    newData[dataset] = values.map(function (element) {
      var obj = {}
      for (var p in element) {
        obj.id = p
        obj.count = element[p]
      }
      obj.rank = rank++
      return obj
    })
  })
  return newData
}

export const reformatCheckout = function (data) {
  var newData = {}
  checkoutDatasets.forEach(function (dataset) {
    var fields = dataset.split('.')
    var values = []
    if (fields.length === 2) {
      values = data.value.data[fields[0]][fields[1]].values
    } else {
      values = data.value.data[dataset].values
    }
    // console.log(data.value.data[dataset].values)
    var rank = 1
    newData[dataset] = values.map(function (element) {
      var obj = {}
      for (var p in element) {
        obj.id = p
        obj.count = element[p]
      }
      obj.rank = rank++
      return obj
    })
  })
  return newData
}

export const calcDiffs = function (data, app) {
  let results = [{}, {}]
  let appDatasets = []
  if (app === 'pageviews') {
    appDatasets = datasets
  }
  if (app === 'composer') {
    appDatasets = composerDatasets
  }
  if (app === 'checkout') {
    appDatasets = checkoutDatasets
  }
  appDatasets.forEach(function (dataset) {
    let oldValues = data.results[0][dataset]
    let newValues = data.results[1][dataset]
    newValues.forEach(function (newRecord) {
      var oldRecord = oldValues.find(function (oldRecord) {
        if (newRecord.id === oldRecord.id) {
          return oldRecord
        }
      })
      if (oldRecord) {
        newRecord.diff = (newRecord.count - oldRecord.count)
        newRecord.rankDiff = -(newRecord.rank - oldRecord.rank)
        if (newRecord.diff > 0) {
          newRecord.vector = 'increasing'
        } else {
          newRecord.vector = 'decreasing'
        }
      } else {
        newRecord.diff = 0
        newRecord.rankDiff = 0
      }
    })
    results[0][dataset] = oldValues
    results[1][dataset] = newValues
  })
  return results
}
