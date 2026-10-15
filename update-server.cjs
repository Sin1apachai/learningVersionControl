const http = require("node:http");

const latestRelease = {
    version: "1.1.0",
    notes: "เพิ่มปุ่มเปอร์เซ็นต์และประวัติการคำนวณ"
};

const server = http.createServer((request, response) => {
    if (request.url !== "/latest.json") {
        response.writeHead(404);
        response.end("Not found");
        return;
    }

    response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });

    response.end(JSON.stringify(latestRelease));
});

server.listen(3500, "127.0.0.1", () => {
    console.log("Update server: http://127.0.0.1:3500/latest.json");
});