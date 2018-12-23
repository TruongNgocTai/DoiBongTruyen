//initallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql");
var app = express();


// body  parser midleWare
app.use(bodyParser.json());
//app.use(express.bodyParser());

//CORS midleWare
app.use(function(req, res, next) {
    //enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allows-Methods", "GET, HEAD, OPTION, POST, PUT");
    res.header("Access-Control-Allows-Headers", "Origin, X-Request-With, ContentType, Content-Type, Acept, Authorization");
    next()
});

//setting up server
var server = app.listen(process.env.PORT || 5000, function() {
    var port = server.address().port;
    console.log("App now runing on port", port);
});

//Initialising connection string
var dbConfig = {
    user: "tai",
    password: "123",
    server: "localhost",
    database: "EC2018DB",
    options: {
        trustedConnection: true,
        useUTC: true
    }
};

// here we connect to database and execute query
var executeQuery = function(res, query) {
    sql.connect(dbConfig, function(err) {
        if (err) {
            console.log("Error while connecting database :- " + err);
            //res.send(err);
        } else {
            // create requests object
            var request = new sql.Request();
            // query to the database
            request.query(query, function(err, recordset) {
                if (err) {
                    console.log("Error while query database :- " + err);
                    res.send(err);
                } else {
                    res.send(recordset);
                    sql.close();
                }
            });
        }
    });
}

// get API
// lấy thông tin khách hàng
app.get("/:IDKhachHang", function(req, res) {
    var idkh = req.params.IDKhachHang;

    var query = 'select TenKhachHang, SoDienThoai, Email from KhachHang where KhachHang.MaKhachHang = \'' +
                    idkh + '\'';
    executeQuery(res, query);
});
// lấy danh sách vé của ID
app.get(`/:IDKhachHang/danhsachve`, function(req, res) {
    var idkh = req.params.IDKhachHang;
    var query = 'select * from Ve where MaVe in \
                    (select MaVe from CT_HoaDon, HoaDon where CT_HoaDon.MaHoaDon = \
                    HoaDon.MaHoaDon and HoaDon.MaKhachHang = \'' + idkh + '\' )';
    executeQuery(res, query);
});
// lấy thông tin cả bảng 

// lấy thông tin các chuyến đi: theo tuyến và ngày giờ cho trước
app.get("/search/:noidi/:noiden/:ngaydi", function(req, res) {
    var noidi = req.params.noidi;
    var noiden = req.params.noiden;
    var ngaydi = req.params.ngaydi;

    var query = "select DISTINCT TenNhaXe, SoXe, LoaiXe Soghe, NgayXuatPhat, GioXuatPhat, LoTrinh.MaDiemDi,LoTrinh.MaDiemDen\
                from LoTrinh, Xe, NhaXe, ChuyenXe, DiaDiem as DD1\
                where LoTrinh.MaLoTrinh = ChuyenXe.MaLoTrinh\
                and ChuyenXe.MaXe = Xe.SoXe and Xe.MaNhaXe = \NhaXe.MaNhaXe and \
                LoTrinh.MaDiemDi=" + "\'" + noidi + "\'" + "and LoTrinh.MaDiemDen=" +
        "\'" + noiden + "\'" + "and ChuyenXe.NgayXuatPhat = " + "\'" + ngaydi + "\'";
    console.log(query); //String(fomat(max(dTime),ngaydi))
    executeQuery(res, query);
});

// tạo tài khoảng mới
// thực hiện post này sau khi đã kiểm tra các thông tin yêu cầu đúng điều kiện.
app.post('/user/register', function(req, res){
    var query = 'insert into [KhachHang] (TenKhachHang, SoDienThoai, Email) \
                    values (req.body.Name, req.body.phonenumber, req.body.email)\
                select top 1  from KhachHang \
                insert  into [DangNhap] (TenDangNhap, MatKhau, LoaiTaiKhoan, MaKH-NX) \
                    values (req.body.Name, req.body.password, req.body.acctype, \
                        select top 1 MaKhachHang from KhachHang order by DESC)'
    executeQuery(res, query);
});

// tạo vé
app.post('create/ticket/', function(req, res){
    var query = 'insert into [ve] (MaKhachHang, MaChuyenXe, MaGhe) \
                    values (req.body.userid, req.body.busesID, req.body.chairid)'
    executeQuery(res, query);
});

// hủy vé
// hủy cả hóa đơn của vé này


// -------Nam---------

//lay thong tin toan chiec xe cua nha xe ID
app.get(`/buscompany/:busCompanyID/buses`, function(req, res) {


    var busCompanyID = req.params.busCompanyID;

    // query to the database and get the records
    var query = `SELECT TenNhaXe,LoaiXe,MaXe ,SoGhe, DD1.TenDiaDiem AS DiaDiemDi, DD2.TenDiaDiem as DiaDiemDen
FROM Xe, NhaXe, LoTrinh, DiaDiem AS DD1, DiaDiem AS DD2, ChuyenXe
WHERE Xe.SoXe=ChuyenXe.MaXe AND ChuyenXe.MaLoTrinh=LoTrinh.MaLoTrinh AND Xe.MaNhaXe=NhaXe.MaNhaXe AND LoTrinh.MaDiemDi=DD1.MaDiaDiem AND LoTrinh.MaDiemDen=DD2.MaDiaDiem AND NhaXe.MaNhaXe='` + busCompanyID + `'`
    executeQuery(res, query);
});

//lay thong tin 1 chiec xe voi busID cua nha xe CompanyID
app.get(`/buscompany/:busCompanyID/buses/:busID`, function(req, res) {
    var busCompanyID = req.params.busCompanyID;
    var busID = req.params.busID;

    var query = `SELECT TenNhaXe,LoaiXe,MaXe ,SoGhe, DD1.TenDiaDiem AS DiaDiemDi, DD2.TenDiaDiem as DiaDiemDen
FROM Xe, NhaXe, LoTrinh, DiaDiem AS DD1, DiaDiem AS DD2, ChuyenXe
WHERE Xe.SoXe=ChuyenXe.MaXe AND ChuyenXe.MaLoTrinh=LoTrinh.MaLoTrinh AND Xe.MaNhaXe=NhaXe.MaNhaXe AND LoTrinh.MaDiemDi=DD1.MaDiaDiem AND LoTrinh.MaDiemDen=DD2.MaDiaDiem AND NhaXe.MaNhaXe='` + busCompanyID + `' AND MaXe='` + busID + `'`
    executeQuery(res, query);
});

//chinh sua thong tin nha xe
app.put(`/edit/buscompany/edit/:busCompanyID`, function(req, res) {
    var busCompanyID = req.params.busCompanyID;
    //var data = req.body;
    var SoDienThoai = req.body.SoDienThoai;
    var Email = req.body.Email;
    var TenNhaXe = req.body.TenNhaXe;
    var SoLuongXe = req.body.SoLuongXe;

    var query = `UPDATE NhaXe 
SET SoDienThoai='` + SoDienThoai + `', Email='` + Email + `',TenNhaXe=N'` + TenNhaXe + `', SoLuongXe='` + SoLuongXe + `'
WHERE MaNhaXe='` + busCompanyID + `'`
    executeQuery(res, query);
    //console.dir(data);
});

//chinh sua thong tin xe
app.put(`/edit/buscompany/:busCompanyID/buses/:busID`, function(req, res) {
    var busCompanyID = req.body.busCompanyID;
    var busID = req.body.busID;
    var LoaiXe = req.body.LoaiXe;
    var Soghe = req.body.Soghe;

    var query = `UPDATE Xe
	SET LoaiXe=N'` + LoaiXe + `', Soghe= ` + Soghe + `'
	WHERE SoXe=` + SoXe + `' AND MaNhaXe='` + busCompanyID + `'`
    executeQuery(res, query);
});

//lay danh sach dia diem

app.get(`/place`, function(req,res){
	var query=`SELECT * FROM DiaDiem`
	executeQuery(res,query);
});
