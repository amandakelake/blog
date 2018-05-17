// 查询字符串
const qs = require('querystring');

// 发送HTML响应
exports.sendHtml = (res, html) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}

// 解析HTTP POST数据
exports.parseReceivedData = (req, cb) => {
  let body = '';
  req.setEncoding('utf8');
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    // 该方法会把一个 URL 查询字符串 str 解析成一个键值对的集合
    const data = qs.parse(body);
    cb(data);
  })
}

// 渲染简单的表单
exports.actionForm = (id, path, label) => { 
  var html = '<form method="POST" action="' + path + '">' +
    '<input type="hidden" name="id" value="' + id + '">' +
    '<input type="submit" value="' + label + '" />' +
    '</form>';
  return html;
};

// MySQL add
exports.add = (db, req, res) => {
  exports.parseReceivedData(req, work => {
    db.query(
      "INSERT INTO work (hours, date, description) " + 
      " VALUES (?, ?, ?)",
      [work.hours, work.date, work.description],
      err => {
        if (err) throw err;
        exports.show(db, res);
      }
    )
  })
}

exports.delete = (db, req, res) => {
  exports.parseReceivedData(req, function(work) { 
    db.query(
      "DELETE FROM work WHERE id=?", 
      [work.id], 
      function(err) {
        if (err) throw err;
        exports.show(db, res); 
      }
    );
  });
};

exports.archive = (db, req, res) => {
  exports.parseReceivedData(req, function(work) { 
    db.query(
      "UPDATE work SET archived=1 WHERE id=?", 
      [work.id], 
      function(err) {
        if (err) throw err;
        exports.show(db, res); 
      }
    );
  });
};

exports.show = (db, res, showArchived) => {
  var query = "SELECT * FROM work " + 
    "WHERE archived=? " +
    "ORDER BY date DESC";
  var archiveValue = (showArchived) ? 1 : 0;
  db.query(
    query,
    [archiveValue], 
    function(err, rows) {
      if (err) throw err;
      html = (showArchived)
        ? ''
        : '<a href="/archived">Archived Work</a><br/>';
      html += exports.workHitlistHtml(rows); 
      html += exports.workFormHtml();
      exports.sendHtml(res, html); 
    }
  );
};

exports.showArchived = (db, res) => {
  exports.show(db, res, true); 
};

exports.workHitlistHtml = (rows) => {
  var html = '<table>';
  for(var i in rows) { 
    html += '<tr>';
    html += '<td>' + rows[i].date + '</td>';
    html += '<td>' + rows[i].hours + '</td>';
    html += '<td>' + rows[i].description + '</td>';
    if (!rows[i].archived) { 
      html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
    }
    html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
    html += '</tr>';
  }
  html += '</table>';
  return html;
};

exports.workFormHtml = () => {
  var html = '<form method="POST" action="/">' + 
    '<p>Date (YYYY-MM-DD):<br/><input name="date" type="text"><p/>' +
    '<p>Hours worked:<br/><input name="hours" type="text"><p/>' +
    '<p>Description:<br/>' +
    '<textarea name="description"></textarea></p>' +
    '<input type="submit" value="Add" />' +
    '</form>';
  return html;
};

exports.workArchiveForm = (id) => { 
  return exports.actionForm(id, '/archive', 'Archive');
}

exports.workDeleteForm = (id) => { 
  return exports.actionForm(id, '/delete', 'Delete');
}