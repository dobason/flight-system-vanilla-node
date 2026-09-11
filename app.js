const http = require('node:http');
const { buffer } = require('node:stream/consumers');

const server = http.createServer((req, res) => {
  if (req.url === '/api/flights' && req.method === "GET") {
    console.log('Đang tìm chuyến bay');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Lấy danh sách chuyến bay thành công" }));
  } 
  else if (req.url === '/api/bookings' && req.method === "POST") {
    console.log('Đang đặt vé máy bay');
    let body = [];
    req.on('data', chunk => {body.push(chunk)})
       .on('end', () => {
            const rawString = Buffer.concat(body).toString();
            const parsedData = JSON.parse(rawString);
            console.log('Dữ liệu nhận được', parsedData);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Đặt vé thành công", data: parsedData }));
        }
    )} 
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
