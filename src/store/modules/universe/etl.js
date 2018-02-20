import * as moment from 'moment'
import * as d3 from 'd3'

export const formatTree = function (treeData) {
  var me = this
  let g = treeData
  let td = {
    children: [
    ]
  }

  let ct = 0
  let co = 0

  while (ct < g.length) {
    let dg = g[ct]
    if (co > 19) {
      co = 0
    }
    let j = {
      id: dg.key,
      name: dg.key,
      children: [
        {
          count: dg.value.sumPageviews.sum,
          id: dg.key,
          name: dg.key
        }
      ]
    }
    if (dg.value.sumPageviews.sum > 500000 && dg.key != 'US Homepage' && dg.value.count > 0) {
      td.children.push(j)
      co++
    }
    ct++
  }

  return td
}

export const formatUniverseData = function (data) {

  return data.data.data.data.map(f => {
    f.pageviews = f['# of Pageviews']
    f.createdDate = parseDate(f.contentCreated)
    f.sessions = f['Unique Sessions']
    f.browsers = f['Unique Browsers']
    return f
  })
}

export const parseDate = function (d) {
  let y = new Date(d.substring(0, 4),
    d.substring(5, 7),
    d.substring(8, 10))
  return y;
}

export const monthsAgo = function (d) {
  let h = moment(d, "YYYY-MM-DD").fromNow().replace(" ago","").replace("a ", "1 ")
  let bin = null
  if (h.includes('year')) {
    let df = h.substring(0,2)
    if (df == 1) {
      bin = "1 yr"
    }
    if (df == 2) {
      bin = "2 yr"
    }
    if (df >= 3) {
      bin = "> 3 yr"
    }
  } else {
    let df = Number(h.substring(0,2))
    if (df == 1) {
      bin = "1 mo"
    } else if (df == 2) {
      bin = "2 mo"
    } else if (df >= 3 && df <= 6) {
      bin = "3-6 mo"
    } else if (df >= 7 && df <= 12) {
      bin = "6-12 mo"
    }
  }
  return bin
}
