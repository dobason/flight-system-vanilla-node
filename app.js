const http = require('node:http');
const { buffer } = require('node:stream/consumers');
const mysql = require('mysql2');

//Tạo kết nối CSDL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tripma_db',
  port: 3307
})

//Khoi tao server
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  //API lay danh sach chuyen bay
  if (req.url === '/api/flights' && req.method === "GET") {
    db.query('SELECT * FROM flight', (err, results) => {
      if (err) {
        
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Lỗi truy vấn cơ sở dữ liệu" }));
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify({ message: "Lấy dữ liệu từ DB thành công", data: results }));
    });    
  } 
  //API dat ve may bay
  else if (req.url === '/api/bookings' && req.method === "POST") {
    //Hung stream de gom du lieu tho vao body
      let body = [];
      req.on('data', bookingFlight => {body.push(bookingFlight)})
         .on('end', () =>{
            const rawString = Buffer.concat(body).toString();
            const parseData = JSON.parse(rawString);
             const sql = 'INSERT INTO booking_flight (booking_id, flight_id, direction, cabin_class, price) VALUES (?,?,?,?,?)'
             const values = [parseData.booking_id, parseData.flight_id, parseData.direction, parseData.cabin_class, parseData.price]
                db.query(sql, values, (err, results) => { 
                  if(err) {
                    //Ghi Log để thông báo lỗi
                    console.log('CHI TIẾT LỖI TỪ MYSQL:', err);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: "Lỗi truy vấn cơ sở dữ liệu" }));
                    return;
                  }
                  res.writeHead(201);
                  res.end(JSON.stringify({ message: "Đặt vé thành công", data: parseData }));
          })})
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Lỗi: Không tìm thấy API" }));
  }
});

server.on('clientError', (err, socket) => {
    console.log("Phat hien client error: ", err.code)
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8000, () => {
    console.log('Server Flight System đang chạy tại http://localhost:8000');
});
