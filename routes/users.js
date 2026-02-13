var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
const bcrypt = require('bcryptjs');
const Users = require('../db/models/Users');
const UserRoles = require('../db/models/UserRoles');
const Roles = require('../db/models/Roles')
const RolePrivileges = require('../db/models/RolePrivileges');
const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Enums = require('../config/Enums');
const role_privileges = require('../config/role_privileges');
const config = require('../config');
const AuditLogs = require('../lib/AuditLogs');



/* GET Users Listing - Tüm kullanıcıları ve Rollerini getir */
router.get('/', async function(req, res, next) {
    try {
        let users = await Users.aggregate([
            // 1. Adım: Kullanıcıları 'user_roles' tablosuyla eşleştir
            {
                $lookup: {
                    from: "user_roles",      // Hedef tablo (MongoDB'deki koleksiyon adı)
                    localField: "_id",       // Users tablosundaki ID
                    foreignField: "user_id", // user_roles tablosundaki karşılığı
                    as: "user_roles"         // Çıktı olarak atanacak geçici isim
                }
            },
            // 2. Adım: Az önce çektiğimiz verideki 'role_id'leri kullanarak 'roles' tablosuna git
            {
                $lookup: {
                    from: "roles",
                    localField: "user_roles.role_id", // user_roles dizisinin içindeki role_id'ler
                    foreignField: "_id",
                    as: "roles" // Kullanıcının rolleri bu diziye dolacak
                }
            },
            // 3. Adım: Çıktıyı düzenle (Şifreyi gizle, gereksiz alanları at)
            {
                $project: {
                    _id: 1,
                    email: 1,
                    first_name: 1,
                    last_name: 1,
                    phone_number: 1,
                    is_active: 1,
                    "roles.role_name": 1, // Rolün sadece ismini göster
                    "roles._id": 1        // Rolün ID'sini göster
                }
            }
        ]);

        res.json(Response.successResponse(users));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Login */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'Email and password are required');
        }

        const user = await Users.findOne({ email: email });
        if (!user) {
            throw new CustomError(Enums.HTTP_CODES.UNAUTHORIZED, 'Auth Error', 'Email or Password wrong');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new CustomError(Enums.HTTP_CODES.UNAUTHORIZED, 'Auth Error', 'Email or Password wrong');
        }

        const payload = {
            id: user._id,
            email: user.email
        };

        const token = jwt.sign(payload, config.JWT.SECRET, {
            expiresIn: config.JWT.EXPIRE_TIME
        });

        AuditLogs.info(email, "Users", "Login", { _id: user._id });

        res.json(Response.successResponse({
            token: token,
            user: {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        }));

    } catch (err) {
        AuditLogs.error(req.body?.email || "Unknown", "Users", "Login", err);
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/add', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body.email) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'email field is required');
        if (!body.password) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'password field is required');
        
        if(body.password.length < Enums.PASSWORD_LENGTH) 
            throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', `password must be at least ${Enums.PASSWORD_LENGTH} characters long`);

        let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

        // 1. Kullanıcıyı Kaydet
        let user = new Users({
            email: body.email,
            password: password,
            is_active: body.is_active,
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number
        });
        await user.save();

        // 2. Rolleri Kaydet (Eğer body.roles gönderildiyse)
        // Örnek JSON body: { "email": "...", "roles": ["ID_STRING_1", "ID_STRING_2"] }
        if (body.roles && Array.isArray(body.roles) && body.roles.length > 0) {
            for (let roleId of body.roles) {
                await UserRoles.create({
                    role_id: roleId,
                    user_id: user._id
                });
            }
        }

        res.json(Response.successResponse(user));

    } catch (err) {
        if (err.code == 11000) {
            let error = new CustomError(Enums.HTTP_CODES.CONFLICT, 'Conflict', 'Email already exists');
            return res.status(Enums.HTTP_CODES.CONFLICT).json(Response.errorResponse(error));
        }
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Update User - Kullanıcı ve Rollerini Güncelle */
router.post('/update', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id field is required to update');

        // 1. Kullanıcı Tablosunu (Users) Güncelle
        let updates = {};

        if (body.password && body.password.length >= Enums.PASSWORD_LENGTH) {
            updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
        }
        if (body.first_name) updates.first_name = body.first_name;
        if (body.last_name) updates.last_name = body.last_name;
        if (body.phone_number) updates.phone_number = body.phone_number;
        if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;

        await Users.updateOne({ _id: body._id }, { $set: updates });

        // 2. Rolleri Güncelle (UserRoles Tablosu)
        if (body.roles && Array.isArray(body.roles)) {
            
            // Adım A: Bu kullanıcıya ait eski tüm rol eşleşmelerini sil
            await UserRoles.deleteMany({ user_id: body._id });

            // Adım B: Yeni gelen rol listesini ekle
            for (let roleId of body.roles) {
                await UserRoles.create({
                    role_id: roleId,
                    user_id: body._id
                });
            }
        }

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

/* POST Delete User - Kullanıcı Sil */
router.post('/delete', async function(req, res, next) {
    let body = req.body;
    try {
        if (!body._id) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', '_id field is required to delete');

        await Users.deleteOne({ _id: body._id });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

router.post('/register', async function(req, res, next) {
    let body = req.body;
    let createdUser = null; // Hata durumunda silmek için referans tutuyoruz

    try {
        let user = await Users.findOne({});
        if (user) {
            return res.sendStatus(Enums.HTTP_CODES.NOT_FOUND);
        }

        if (!body.email) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'email field is required');
        if (!body.password) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'password field is required');
        if (body.password.length < Enums.PASSWORD_LENGTH) throw new CustomError(Enums.HTTP_CODES.BAD_REQUEST, 'Validation Error', 'Password length must be greater than ' + Enums.PASSWORD_LENGTH);

        let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

        // 1. Kullanıcıyı Oluştur
        createdUser = new Users({
            email: body.email,
            password: password,
            is_active: true,
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number
        });
        await createdUser.save();

        // 2. Rolü Bul veya Oluştur (SUPER_ADMIN)
        let roleName = Enums.SUPER_ADMIN;
        let role = await Roles.findOne({ role_name: roleName });

        if (!role) {
            role = new Roles({
                role_name: roleName,
                is_active: true,
                created_by: createdUser._id
            });
            await role.save();

            // --- EKLEME BURADA: Super Admin'e TÜM yetkileri ver ---
            let permissions = role_privileges.privileges.map(p => p.key); // Config'den tüm key'leri al
            
            for (let i = 0; i < permissions.length; i++) {
                let priv = new RolePrivileges({
                    role_id: role._id,
                    permission: permissions[i],
                    created_by: createdUser._id
                });
                await priv.save();
            }   
        }

        // 3. Kullanıcı ve Rolü İlişkilendir
        await UserRoles.create({
            role_id: role._id,
            user_id: createdUser._id
        });

        res.json(Response.successResponse({
            success: true,
            message: "System initialized. Super Admin created with ALL privileges.",
            data: createdUser
        }));

    } catch (err) {
        //ROLLBACK
        if (createdUser) {
            await Users.deleteOne({ _id: createdUser._id });
        }

        let errorResponse = Response.errorResponse(err);
        res.status(err.code || Enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
});

module.exports = router;